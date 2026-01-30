import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SeungHyuk Hong',
    template: '%s | SeungHyuk Hong',
  },
  description: 'AI Researcher specializing in machine learning, deep learning, and natural language processing.',
  keywords: ['AI', 'Machine Learning', 'Deep Learning', 'NLP', 'Research', 'Portfolio'],
  authors: [{ name: 'SeungHyuk Hong' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://seunghyukhong.com',
    title: 'SeungHyuk Hong | AI Researcher',
    description: 'AI Researcher specializing in machine learning, deep learning, and natural language processing.',
    siteName: 'SeungHyuk Hong',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SeungHyuk Hong | AI Researcher',
    description: 'AI Researcher specializing in machine learning, deep learning, and natural language processing.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
