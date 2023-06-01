# json-patcher

A JSON Patch (RFC 6902) and JSON Merge Patch (RFC 7396) implementation for JS (browser and Node) using Rust.

This library is built with:
- [Neon](https://neon-bindings.com) for Node bindings
- WebAssembly for browser

Implementation of the patch and merge alogrithms is provided using [json-patch](https://docs.rs/json-patch/) crate.

## Installing json-patcher

Installing json-patcher requires a [supported version of Node and Rust](https://github.com/neon-bindings/neon#platform-support).

You can install the project with npm.

```sh
$ npm install @formbird/json-patcher
```

This fully installs the project, including installing any dependencies and running the build.

## Contributing

### Building json-patcher

Make sure you have Rust and [`wasm-pack`](https://rustwasm.github.io/wasm-pack/) installed. From the checked out source, run:

```sh
$ npm run build
```

This command will build native Node bindings and the WASM binary. `node:build` and `browser:build` scripts can be used to build them induvially. The scripts can be appended with `:release` to build in release mode.

