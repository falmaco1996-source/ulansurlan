import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import os from "node:os";

export default defineConfig({
  plugins: [react()],

  // PINDAHKAN CACHE VITE KELUAR DARI node_modules (ini yang nyebabin EPERM di Windows)
  cacheDir: path.join(os.tmpdir(), "vite-cache-ulan-site"),

  // opsional tapi membantu kalau lockfile berubah
  optimizeDeps: {
    force: true,
  },
});
