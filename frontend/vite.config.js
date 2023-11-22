/* eslint-disable import/no-extraneous-dependencies, sort-keys-fix/sort-keys-fix */

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  build: {
    outDir: './build'
  },

  plugins: [react(), viteTsconfigPaths(), svgr()],

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
