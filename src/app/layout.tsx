import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Abricot - Gestion de Projet',
  description: 'Application SaaS de gestion de projet collaboratif',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} antialiased bg-background text-foreground`}>
        <Providers>
            <AuthProvider>
                {children}
            </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
