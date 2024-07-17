import { defineConfig } from 'vite'
import dts from "vite-plugin-dts";
import path from 'path';
export default defineConfig({
    plugins: [dts()],
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "match",
            fileName: (format) => `index.${format}.js`,
        },
        sourcemap: true,
        emptyOutDir: true,
        cssCodeSplit: true,
    }
})