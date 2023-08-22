import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BingAI',
    short_name: 'BingAI',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    lang: 'zh-CN',
    scope: '/',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any'
      },
    ]
  }
}
