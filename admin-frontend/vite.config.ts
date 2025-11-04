import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa';


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
  start_url: "/"
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
})
