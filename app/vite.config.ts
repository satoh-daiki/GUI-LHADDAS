import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'
import path from 'path'

export default defineConfig({
  base: './',
  plugins: [react(), cesium()],
  resolve: {
   alias:{
     react: path.resolve(__dirname,'node_modules/react'),
     'react-dom': path.resolve(__dirname,'node_modules/react-dom')
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,
  },
})

