import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/**
 * Production-only tweaks to index.html for a faster first paint on Vercel:
 *  1. the main stylesheet is inlined, so no request blocks rendering
 *  2. the body font is preloaded, so text does not swap fonts late
 *  3. the browser opens the connection to the API early
 */
function htmlPerformance(apiBase) {
  return {
    name: 'pms-html-performance',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle || {}
        const tags = []
        const out = html.replace(/<link rel="stylesheet"[^>]*href="\/(assets\/index-[^"]+\.css)"[^>]*>/, (tag, file) => {
          const asset = bundle[file]
          if (!asset || asset.type !== 'asset') return tag
          delete bundle[file]
          return `<style>${asset.source}</style>`
        })
        const font = Object.keys(bundle).find((f) => /ibm-plex-sans-latin-400-normal-[^/]+\.woff2$/.test(f))
        if (font) tags.push({ tag: 'link', attrs: { rel: 'preload', href: `/${font}`, as: 'font', type: 'font/woff2', crossorigin: '' }, injectTo: 'head' })
        try {
          const origin = new URL(apiBase).origin
          if (origin && typeof window === 'undefined') tags.push({ tag: 'link', attrs: { rel: 'preconnect', href: origin, crossorigin: '' }, injectTo: 'head' })
        } catch { /* no API base at build time: nothing to preconnect */ }
        return { html: out, tags }
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), htmlPerformance(env.VITE_API_BASE_URL || '')],
    build: {
      // React and the router change rarely: their own chunk stays cached across app updates
      rollupOptions: { output: { advancedChunks: { groups: [{ name: 'react', test: /node_modules[\\/](react|react-dom|react-router|scheduler)/ }] } } },
    },
  }
})
