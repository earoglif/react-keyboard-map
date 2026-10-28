import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    outDir: 'dist/mcp',
    emptyOutDir: true,
    lib: {
      entry: {
        server: resolve(rootDir, 'src/mcp/server.ts'),
        cli: resolve(rootDir, 'src/mcp/cli.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [/^@modelcontextprotocol\/sdk(?:\/.*)?$/, 'zod'],
      output: {
        banner: (chunk) => (chunk.name === 'cli' ? '#!/usr/bin/env node\n' : ''),
        chunkFileNames: 'keyboard-config.js',
      },
    },
    sourcemap: true,
  },
})
