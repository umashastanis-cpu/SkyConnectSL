import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'

export const metadata: Metadata = {
  title: 'SkyConnect SL - Sri Lanka\'s Premier Travel Platform',
  description: 'Connect with verified local service providers. Discover authentic experiences, book tours, hotels, and transport across Sri Lanka.',
  keywords: 'Sri Lanka travel, tours, hotels, transport, local guides, tourism, SkyConnect SL',
  authors: [{ name: 'SkyConnect Team' }],
  openGraph: {
    title: 'SkyConnect SL - Sri Lanka Travel Made Easy',
    description: 'Your trusted platform for authentic Sri Lankan experiences',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
