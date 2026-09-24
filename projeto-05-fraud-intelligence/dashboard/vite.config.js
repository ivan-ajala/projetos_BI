import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Mantém o padrão de publicação do Projeto 04 no GitHub Pages.
  base: process.env.NODE_ENV === 'development' ? '/' : '/projeto-05/',
})
