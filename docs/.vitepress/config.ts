import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@anilkumarthakur/collection',
  description: 'A fluent, Laravel-inspired Collection library for JavaScript and TypeScript',
  cleanUrls: true,

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API Reference', link: '/api/' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Usage', link: '/guide/usage' },
          { text: 'Lazy Collections', link: '/guide/lazy-collections' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/' },
          { text: 'A - C', link: '/api/a-c' },
          { text: 'D - F', link: '/api/d-f' },
          { text: 'G - M', link: '/api/g-m' },
          { text: 'N - R', link: '/api/n-r' },
          { text: 'S', link: '/api/s' },
          { text: 'T - Z', link: '/api/t-z' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/anilkumarthakur60/collection-js' }
    ],
    
    search: {
      provider: 'local'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Anil Kumar Thakur'
    }
  }
})
