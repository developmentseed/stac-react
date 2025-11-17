import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'StacReact',
      formats: ['es', 'cjs'],
      fileName: (format) => `stac-react.${format === 'es' ? 'es.mjs' : 'cjs'}`,
    },
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'react-dom', '@tanstack/react-query'],
    },
  },
  plugins: [
    dts({
      exclude: ['**/*.test.ts'],
      outDir: 'dist',
    }),
  ],
});
