import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import Icons from "unplugin-icons/vite";
// import basicSsl from "@vitejs/plugin-basic-ssl";
// import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [
    // basicSsl(),
    // mkcert(),
    tailwindcss(),
    sveltekit(),
    Icons({
      compiler: "svelte",
      autoInstall: true,
    }),
  ],
  // server: {
  //   https: true, // Instructs Vite to boot with TLS/HTTP2
  // },
  build: {
    sourcemap: true, // Enable source maps for the build
  },
});
