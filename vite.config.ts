import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const plugins = [react()]
  if (mode !== 'lib') return { plugins }

  return {
    plugins,
    build: {
      lib: {
        entry: resolve(rootDir, 'src/index.ts'),
        name: 'ReactKeyboardMap',
        formats: ['es'],
        fileName: 'index',
        cssFileName: 'style',
      },
      rollupOptions: {
        external: (id) =>
          id === 'react' ||
          id.startsWith('react/') ||
          id === 'lucide-react' ||
          id.startsWith('lucide-react/'),
      },
      sourcemap: true,
    },
  }
})
