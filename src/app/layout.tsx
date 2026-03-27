import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MSP Channel Readiness Assessment | Untapped Channel Strategy',
  description: 'Evaluate your readiness to build a profitable MSP channel program. Get a personalized scorecard, competitive analysis, and financial projections.',
  icons: { icon: '/favicon.ico' },
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
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700;800&family=Lato:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        {/* Fixed background wave -- locked while content scrolls, exact match to main site */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }}>
          <div className="absolute inset-0" style={{ background: "#111111" }} />
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1440 900"
            preserveAspectRatio="none"
            style={{ mixBlendMode: "screen" }}
          >
            <defs>
              <linearGradient id="ucsWaveFill" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#4CF37B" stopOpacity="0.12" />
                <stop offset="0.55" stopColor="#4CF37B" stopOpacity="0.06" />
                <stop offset="1" stopColor="#4CF37B" stopOpacity="0" />
              </linearGradient>
              <filter id="ucsWaveBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="14" />
              </filter>
            </defs>
            <path
              d="M-120 820
                 C 160 700, 360 690, 560 760
                 C 760 832, 960 840, 1140 720
                 C 1300 635, 1440 520, 1560 360
                 L 1560 980
                 L -120 980
                 Z"
              fill="url(#ucsWaveFill)"
              filter="url(#ucsWaveBlur)"
            />
          </svg>
        </div>
        {children}
      </body>
    </html>
  )
}
