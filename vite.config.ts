import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// replace with your Mac's LAN IP
const LAN_IP = "10.251.117.14";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,                 // bind to 0.0.0.0 (LAN)
    port: 8080,
    hmr: { host: LAN_IP, port: 8080 }, // keeps HMR working on iOS Safari
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
}));
