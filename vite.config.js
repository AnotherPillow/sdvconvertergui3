import {defineConfig} from 'vite'
import { sveltekit } from '@sveltejs/kit/vite';
import {svelte} from '@sveltejs/vite-plugin-svelte'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
      $asset: path.resolve("./src/assets"),
      $img: path.resolve("./src/assets/images"),
    },
  },
//   build: {
//     rollupOptions: {
//       input: {
//         main: path.resolve(__dirname, 'src/app.html'), // Adjust the path
//       },
//     },
//   },
})
