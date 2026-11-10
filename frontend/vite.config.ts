/* eslint-disable import-js/no-extraneous-dependencies, sort-keys-fix/sort-keys-fix */

import importMetaEnv from '@import-meta-env/unplugin'
import replace from '@rollup/plugin-replace'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { fileURLToPath } from 'url'
import { defineConfig, type PluginOption } from 'vite'
import svgr from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'

/**
 * monitor-ui can't be tree-shaken (single module): the worker would bundle the whole library for a few helpers.
 * @see src/workers/monitorUiWorkerShim.ts
 */
const monitorUiWorkerShim: PluginOption = {
  enforce: 'pre',
  name: 'monitor-ui-worker-shim',
  resolveId: source =>
    source === '@mtes-mct/monitor-ui'
      ? fileURLToPath(new URL('./src/workers/monitorUiWorkerShim.ts', import.meta.url))
      : undefined
}

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
        index: './index.html'
      },
      output: {
        // Vite 8 bundles with Rolldown, which replaces Rollup's `manualChunks` by `codeSplitting`
        codeSplitting: {
          includeDependenciesRecursively: true,
          groups: [
            {
              name: 'monitor-ui',
              test: /node_modules[\\/]@mtes-mct[\\/]monitor-ui[\\/]/
            }
          ]
        }
      }
    },
    target: 'esnext'
  },
  plugins: [
    react(),
    /**
     * Used to fix https://github.com/MTES-MCT/monitorfish/issues/3211
     * @see https://github.com/bvaughn/react-window/issues/227
     */
    // @ts-ignore
    replace({
      'pointerEvents: isScrolling ? "none" : void 0': 'pointerEvents: null'
    }),
    // @ts-ignore
    replace({
      'pointerEvents: isScrolling ? "none" : undefined': 'pointerEvents: null'
    }),
    visualizer({
      emitFile: true,
      filename: 'bundle_size.html'
    }) as PluginOption,
    viteTsconfigPaths(),
    svgr(),
    importMetaEnv.vite({
      env: './.env',
      example: './.env.example'
    })
  ],
  worker: {
    plugins: () => [monitorUiWorkerShim, viteTsconfigPaths()]
  },

  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8880'
      },
      '/bff': {
        target: 'http://localhost:8880'
      },
      '/login': {
        target: 'http://localhost:8880'
      },
      '/realms': {
        target: 'http://localhost:8880'
      },
      '/resources': {
        target: 'http://localhost:8880'
      },
      '/logout': {
        target: 'http://localhost:8880'
      },
      '/oauth2': {
        target: 'http://localhost:8880'
      },
      '/proxy': {
        target: 'http://localhost:8880'
      }
    }
  }
})
