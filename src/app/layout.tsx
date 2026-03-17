import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MSP Channel Readiness Assessment | Untapped Channel Strategy',
  description: 'Evaluate your readiness to build a profitable MSP channel program. Get a personalized scorecard, competitive analysis, and financial projections.',
  verification: {
    google: 'J_vJM_47xfzNlD-ZEeKHiGFkgbymd3hCYJf6dc8-EzM',
  },
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
