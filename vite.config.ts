import {defineConfig} from 'vitest/config'
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

export default defineConfig({
    plugins: [
        wasm(),
    ],
    resolve: {
        conditions: ['browser'],
        mainFields: ['browser'],
    },
    test: {
        globals: true,
        browser: {
            enabled: true,
            headless: true,
            name: 'chromium',
            provider: 'playwright'
        }
    }
})
