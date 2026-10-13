import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  // Relative URLs work for both user Pages and repository subdirectories.
  base: "./",
  plugins: [react()],
});
