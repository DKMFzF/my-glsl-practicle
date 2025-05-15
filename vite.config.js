import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue' // если ты используешь Vue

export default defineConfig({
  // plugins: [vue()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  }
})
