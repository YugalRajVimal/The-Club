import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VRK Group — A Private Members\u2019 Society',
  description:
    'An established private members\u2019 club and lifestyle marketplace, extending curated privilege across real estate, travel, collaborations and entertainment.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans bg-ivory text-ink antialiased">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
          <ToastContainer
            position="top-center"
            autoClose={4500}
            hideProgressBar
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="light"
            toastClassName="!font-sans !text-sm !bg-ivory !text-ink !border !border-gold-light/50 !shadow-md"
          />
        </AuthProvider>
      </body>
    </html>
  );
}
