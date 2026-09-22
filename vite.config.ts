import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'react-vendor', test: /node_modules\/(react|react-dom|react-router-dom)\// },
            { name: 'supabase-vendor', test: /node_modules\/@supabase\// },
            { name: 'motion-vendor', test: /node_modules\/framer-motion\// },
            { name: 'form-vendor', test: /node_modules\/(react-hook-form|zod|@hookform)\// },
          ],
        },
      },
    },
  },
})
