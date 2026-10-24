import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { LocationProvider } from '@/context/LocationContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import LocationModal from '@/components/LocationModal';
import AnnouncementBar from '@/components/AnnouncementBar';

export const metadata: Metadata = {
  title: 'Fish Basket — Fresh Catch. Delivered Fresh.',
  description:
    'Order harbor-fresh seafood, river fish, tiger prawns, mud crabs, and calamari online. Cut and cleaned to order, delivered chilled with cold-chain gel ice packs.',
  keywords: [
    'seafood online',
    'fresh fish delivery',
    'buy prawns online',
    'live crabs',
    'seer fish surmai',
    'white pomfret',
    'rohu fish',
    'fish basket',
    'visakhapatnam seafood',
  ],
  openGraph: {
    title: 'Fish Basket — Fresh Catch. Delivered Fresh.',
    description: 'Fresh seafood, prawns, crabs & fish cut the way you like, delivered to your door.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 antialiased selection:bg-teal-100 selection:text-teal-900">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <LocationProvider>
                <AnnouncementBar />
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <CartDrawer />
                <LocationModal />
              </LocationProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
