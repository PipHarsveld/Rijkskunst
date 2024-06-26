import { defineConfig } from 'vite';

const SERVER_PORT = 9999;

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: SERVER_PORT,
  },
});
