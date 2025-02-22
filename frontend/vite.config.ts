/* eslint-disable import/no-extraneous-dependencies, sort-keys-fix/sort-keys-fix */

import importMetaEnv from '@import-meta-env/unplugin'
import replace from '@rollup/plugin-replace'
import react from '@vitejs/plugin-react'
import {defineConfig, type PluginOption} from 'vite'
import svgr from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import {visualizer} from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  build: {
    minify: true,
    outDir: './build',
    sourcemap: true,
    rollupOptions: {
      treeshake: true,
      input: {
        index: './index.html',
      },
      output: {
        manualChunks: {
          'monitor-ui': ['@mtes-mct/monitor-ui']
        }
      },
    },
    target: 'esnext'
  },
  plugins: [
    react(),
    /**
     * Used to fix https://github.com/MTES-MCT/monitorfish/issues/3211
     * @see https://github.com/bvaughn/react-window/issues/227
     */
    replace({
      'pointerEvents: isScrolling ? "none" : void 0': 'pointerEvents: null',
    }),
    replace({
      'pointerEvents: isScrolling ? "none" : undefined': 'pointerEvents: null',
    }),
    visualizer({
      emitFile: true,
      filename: "bundle_size.html",
    }) as PluginOption,
    viteTsconfigPaths(),
    svgr(),
    importMetaEnv.vite({
      env: './.env',
      example: './.env.example'
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
