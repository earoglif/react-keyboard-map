import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDir = join(dirname(fileURLToPath(import.meta.url)), '../dist')

async function rewriteDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true })

  await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) {
        await rewriteDirectory(path)
        return
      }
      if (!entry.name.endsWith('.d.ts')) return

      const source = await readFile(path, 'utf8')
      const rewritten = source.replaceAll(
        /(from\s+['"])(\.\.?\/[^'"]+?)\.tsx?(['"])/g,
        '$1$2.js$3',
      )
      if (rewritten !== source) await writeFile(path, rewritten)
    }),
  )
}

await rewriteDirectory(distDir)
