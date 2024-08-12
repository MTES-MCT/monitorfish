/* eslint-disable import/no-extraneous-dependencies, sort-keys-fix/sort-keys-fix */

import importMetaEnv from '@import-meta-env/unplugin'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  build: {
    outDir: './build',
    sourcemap: true
  },

  plugins: [
    react(),
    viteTsconfigPaths(),
    svgr(),
    importMetaEnv.vite({
      env: resolve(import.meta.dirname, '.env'),
      example: resolve(import.meta.dirname, '.env.example')
    })
  ],

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8880'
      },
      '/bff': {
        target: 'http://localhost:8880'
      }
    }
  }
})
