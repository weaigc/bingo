import { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import Script from 'next/script'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'

import '@/app/globals.scss'


export const metadata: Metadata = {
  title: {
    default: 'Bing AI Chatbot',
    template: `%s - Bing AI Chatbot`
  },
  description: 'Bing AI Chatbot Web App.',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'dark' }
  ],
  icons: {
    icon: '/favicon.ico',
    shortcut: '../assets/images/logo.svg',
    apple: '../assets/images/logo.svg'
  }
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Toaster />
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen">
            {/* @ts-ignore */}
            <Header />
            <main className="flex flex-col flex-1">{children}</main>
          </div>
          <TailwindIndicator />
        </Providers>
        <Script src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </body>
    </html>
  )
}
