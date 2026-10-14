import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Los archivos con hash (JS/CSS del build) salen a /static/ y no a /assets/:
    // /assets/ es también donde viven videos e imágenes de public/ con nombre
    // fijo. Separados, public/_headers puede dar caché de un año ("immutable")
    // solo a lo que lleva hash en el nombre, sin arriesgar que un video
    // reemplazado se quede viejo en el navegador.
    assetsDir: 'static',
    // scripts/postbuild.mjs lo lee para precargar los paquetes de cada página.
    manifest: true,
  },
})
