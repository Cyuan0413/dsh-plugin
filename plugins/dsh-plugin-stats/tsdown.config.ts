import { defineConfig } from 'tsdown'

// Commit the bundled entries so a GitHub subdirectory install needs no build script.
// The Web loader expects a classic script; the Host and maintenance CLI are ESM.
export default defineConfig([
  {
    entry: ['./src/host.ts', './src/cli.ts'],
    format: ['esm'],
    platform: 'node',
    target: 'node22',
    dts: false,
    outDir: 'lib',
    clean: true,
    deps: { alwaysBundle: ['zod', '@deepseek-ai/schemastery', '@deepseek-ai/cosmokit'], onlyBundle: ['zod', '@deepseek-ai/schemastery', '@deepseek-ai/cosmokit'] },
    outputOptions: {
      entryFileNames: (chunk) => chunk.name === 'cli' ? 'cli.js' : '[name].mjs',
      chunkFileNames: '[name].mjs',
    },
  },
  {
    entry: ['./src/client.ts'],
    format: ['iife'],
    platform: 'browser',
    target: 'es2022',
    dts: false,
    outDir: 'lib',
    deps: { alwaysBundle: ['zod'], onlyBundle: ['zod'] },
    outputOptions: { entryFileNames: 'client.js' },
  },
])
