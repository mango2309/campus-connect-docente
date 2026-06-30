import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// El frontend habla SIEMPRE con el API Gateway. Como el backend no expone CORS,
// usamos el proxy del dev server: el navegador pega a /api (mismo origen) y Vite
// reenvía al Gateway. Default 8080 (docker compose, modo demo); para `dotnet run`
// local pon VITE_GATEWAY_URL=http://localhost:5287 en .env.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gateway = env.VITE_GATEWAY_URL || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: gateway,
          changeOrigin: true,
        },
      },
    },
  }
})
