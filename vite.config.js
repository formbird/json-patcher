import {defineConfig} from 'vite'
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

export default defineConfig({
    build: {
        lib: {
            entry: './browser/json_patcher.js',
            name: 'json-patcher',
            fileName: 'index',
            formats: ['es']
        },
        target: 'esnext',
        outDir: 'browser',
        emptyOutDir: false
    },
    plugins: [
        wasm(),
        // topLevelAwait(),
    ]
})
