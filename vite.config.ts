import { defineConfig } from 'vite'
import dts from "vite-plugin-dts";
import path from 'path';
export default defineConfig({
    plugins: [dts()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "collection",
            fileName: (format) => format === "es" ? "index.es.js" : "index.umd.cjs",
        },
        sourcemap: false,
        emptyOutDir: true,
        cssCodeSplit: true,
        rollupOptions: {
            output: {
                exports: "named",
            },
        },
    }
})