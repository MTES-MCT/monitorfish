/* eslint-disable import/no-extraneous-dependencies, sort-keys-fix/sort-keys-fix */

import importMetaEnv from '@import-meta-env/unplugin'
import replace from '@rollup/plugin-replace'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  build: {
    minify: false,
    outDir: './build',
    sourcemap: true,
    rollupOptions: {
      input: {
        index: './index.html',
      },

      plugins: replace({
        'pointerEvents: isScrolling ? "none" : void 0': 'pointerEvents: null',
        preventAssignment: true
      })
    }
  },

  plugins: [
    react(),
    viteTsconfigPaths(),
    svgr(),
    importMetaEnv.vite({
      env: './.env',
      example: './.env.example'
    }),
    sentryVitePlugin({
      org: 'betagouv',
      project: 'monitorfish',
      url: 'https://sentry.incubateur.net/'
    })
  ],

  server: {
    host: 'localhost',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8880'
      },
      '/bff': {
        target: 'http://localhost:8880'
      },
      '/proxy': {
        target: 'http://localhost:8880'
      }
    }
  }
})
