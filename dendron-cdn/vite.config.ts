import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/main.ts",
            name: "Dendron",
            fileName: (format) => `dendron.min.js`,
            formats: ["iife"]
        },
        rollupOptions: {
            external: [],
            output: {
                globals: {}
            }
        },
    },
    // We no longer need the proxy as the widget will call the Edge Function directly.
    // However, for local dev of the WIDGET (not the backend), we could keep it if we had a local edge function runner.
    // For now, removing the proxy to signify the architectural shift.
});
