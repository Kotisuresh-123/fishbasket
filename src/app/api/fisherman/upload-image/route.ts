import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Max file size: 5MB
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    // 1. Authoritative server-side session verification
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    if (session.role !== 'fisherman' && session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Only registered fishermen can upload catch photographs.' },
        { status: 403 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No image file was provided for upload.' },
        { status: 400 }
      );
    }

    // 3. Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported file type: ${file.type}. Please upload a JPEG, PNG, or WebP photograph.`,
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        {
          success: false,
          message: `Photograph size (${sizeMB} MB) exceeds the 5 MB limit. Please choose a smaller image.`,
        },
        { status: 400 }
      );
    }

    // 5. Generate secure unique filename
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const randomHex = crypto.randomBytes(6).toString('hex');
    const safeFilename = `catch-${session.userId}-${Date.now()}-${randomHex}.${ext}`;
    const storagePath = `fisherman-${session.userId}/${safeFilename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let publicUrl = '';

    // 6. Attempt upload to Supabase Storage bucket 'catches'
    try {
      const { data, error: uploadError } = await supabase.storage
        .from('catches')
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError && data) {
        const { data: urlData } = supabase.storage.from('catches').getPublicUrl(storagePath);
        if (urlData && urlData.publicUrl) {
          publicUrl = urlData.publicUrl;
        }
      } else if (uploadError) {
        console.warn('Supabase storage upload notice:', uploadError.message);
      }
    } catch (storageErr: any) {
      console.warn('Supabase storage exception, falling back to local storage:', storageErr.message);
    }

    // 7. Fallback to local storage if Supabase upload was not available
    if (!publicUrl) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'catches');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const localFilePath = path.join(uploadDir, safeFilename);
      fs.writeFileSync(localFilePath, buffer);
      publicUrl = `/uploads/catches/${safeFilename}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      size: file.size,
      mimeType: file.type,
      message: 'Catch photograph uploaded successfully!',
    });
  } catch (err: any) {
    console.error('Catch photo upload error:', err);
    return NextResponse.json(
      { success: false, message: 'Server error processing catch photograph: ' + (err.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
