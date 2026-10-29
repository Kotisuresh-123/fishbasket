import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var stored = localStorage.getItem('fishbasket-theme');
                var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var isDark = stored === 'dark' || (!stored && systemDark);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F4F7F6] dark:bg-[#0B131A] text-[#112233] dark:text-[#EAF2F8] antialiased selection:bg-[#00D2C4]/25 selection:text-[#00D2C4]">
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
