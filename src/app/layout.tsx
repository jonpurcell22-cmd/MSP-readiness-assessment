import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'MSP Channel Readiness Assessment | Untapped Channel Strategy',
  description: 'Evaluate your readiness to build a profitable MSP channel program. Get a personalized scorecard, competitive analysis, and financial projections.',
}

export const viewport: Viewport = {
  themeColor: '#4cf37b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
