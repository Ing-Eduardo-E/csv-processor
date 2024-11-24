import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // Esto es importante para el despliegue
  build: {
    outDir: 'dist', // Directorio donde se generará el build
    assetsDir: 'assets', // Directorio para assets
    sourcemap: false, // Desactivar sourcemaps en producción
    minify: true, // Minificar el código
    chunkSizeWarningLimit: 1000, // Límite de advertencia para el tamaño de chunks
  }
});