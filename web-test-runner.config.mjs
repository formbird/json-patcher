import {join} from 'path'
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';
import rollupCommonJs from '@rollup/plugin-commonjs';
import { fromRollup } from '@web/dev-server-rollup';
import { importMapsPlugin } from '@web/dev-server-import-maps';

const commonJs = fromRollup(rollupCommonJs);

const tsConfigPath = join(process.cwd(), 'test/tsconfig.json')
const chaiPath = join(process.cwd(), 'node_modules/@esm-bundle/chai/esm/chai.js');
console.log(tsConfigPath)

export default {
    nodeResolve: {
        browser: true
    },
    browsers: [playwrightLauncher({})],
    plugins: [
        esbuildPlugin({
            ts: true, target: 'auto', js: true, tsconfig: tsConfigPath
        }),
        commonJs(),
        importMapsPlugin({
            inject: {
                importMap: {
                    imports: {
                        'chai': chaiPath
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
