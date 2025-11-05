import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa';
import path from 'path';


const manifest: Partial<ManifestOptions> | false = {
  theme_color: "#000000",
  background_color: "#ffffff",
  screenshots: [
    {
      src: '/screenshots/desktop.png',
      type: "image/png",
      sizes: "1916x887",
      form_factor: "wide",
    },
    {
      src: '/screenshots/mobile.png',
      type: "image/png",
      sizes: "432x762",
      form_factor: "narrow",
    }
  ],
  orientation: "any",
  display: "standalone",
  lang: "ru-RU",
  name: "neshopify",
  short_name: "neshopify",
  start_url: "/",
  icons: [
    {
      purpose: "maskable",
      sizes: "512x512",
      src: "icon512_maskable.png",
      type: "image/png"
    },
    {
      purpose: "any",
      sizes: "512x512",
      src: "icon512_rounded.png",
      type: "image/png"
    }
  ]
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*{html,css,js,ico,png,svg}"]
      },
      manifest: manifest,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
      '@features': path.resolve(__dirname, './src/features'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@shared': path.resolve(__dirname, './src/shared'),
    }
  }
})
