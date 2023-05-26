import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';
import rollupCommonJs from '@rollup/plugin-commonjs';
import { fromRollup } from '@web/dev-server-rollup';
import { importMapsPlugin } from '@web/dev-server-import-maps';

const commonJs = fromRollup(rollupCommonJs);

export default {
    nodeResolve: {
        browser: true
    },
    watch: true,
    browsers: [playwrightLauncher({})],
    plugins: [
        esbuildPlugin({
            ts: true, target: 'auto', js: true, tsconfig: "/home/hamza/code/formbird/diff-updater/test/tsconfig.json"
        }),
        commonJs(),
        importMapsPlugin({
            inject: {
                importMap: {
                    imports: { 
                        "chai": "/home/hamza/code/formbird/diff-updater/node_modules/@esm-bundle/chai/esm/chai.js",
                    },
                },
            }
        })
    ],
    testRunnerHtml: testFramework =>
    `<html>
      <body>
        <script>var exports = {}</script>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>`,
};
