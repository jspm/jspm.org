+++
title = "JSPM.IO"
description = "JSPM.IO Native Modules CDN"
prev-section = "docs/cdn-resolution"
next-section = "cdn/api"
+++

# JSPM.IO <br />Import Maps CDN

`jspm.io` is a CDN built to support import maps with maximum performance featuring:

* Comprehensive [package optimization](#package-optimization) and minification with source maps.
* Universal URLs with far-future expires _for all resources_.
* The ability to configure all environment conditions for a package, compatible with [Node.js exports conditions](https://nodejs.org/dist/latest/docs/api/packages.html#conditional-exports) and [WinterCG runtime keys](https://runtime-keys.proposal.wintercg.org/) (eg `"development"` / `"production"` / `"browser"` / `"node"` / `"deno"` package entry point variants).
* High performance CDN, with redundant storage and caching layers and 99.99% historical [uptime](https://status.jspm.io/).

## Package Interpretation

Packages on the `jspm.io` CDN are processed to be import maps and browser-compatible based on standard module semantics that have emerged between Node.js and browsers. Imports on the CDN are based on using exact file extensions when loading relative paths, and using import maps for bare specifier resolutions.

The [Node.js ES Modules](https://nodejs.org/dist/latest/docs/api/esm.html) conventions in Node.js are fully supported, alongside the Node.js [package definitions](https://nodejs.org/dist/latest/docs/api/packages.html).

This includes support for the [package exports](https://nodejs.org/dist/latest/docs/api/packages.html#subpath-exports) field, [package imports](https://nodejs.org/dist/latest/docs/api/packages.html#subpath-imports) field, [self-reference resolution](https://nodejs.org/dist/latest/docs/api/packages.html#self-referencing-a-package-using-its-name), [conditional exports](https://nodejs.org/dist/latest/docs/api/packages.html#conditional-exports) definitions, as well as the conversion of CommonJS modules into ES modules.

### CDN URLs

The `jspm.io` CDN is fully versioned. The current version is _version gamma_: `https://ga.jspm.io/`.

This versioning scheme allows immutable caching with far-future expires while still being able to ship major CDN releases over time.

### Modules

Packages are located at their exact registry and version URL known as the canonical package path: `https://ga.jspm.io/npm:pkg@x.y.z/`.

Within the package, all files are served at their original file name locations as per the package published on npm - _but instead of the original module files, optimized module files are served instead_.

### package.json

All packages contain a `package.json` file, which is the processed package.json by JSPM including the enumerated exports and file listing. The `package.json` is all that is needed to enumerate the exports of a package and resolve their URLs in the package, and is also a processed version of the `package.json` created by the CDN.

When the [JSPM CLI](/docs/jspm-cli) or [Generator](/docs/generator) links a package, it uses this `package.json` file for resolution rules.

### Conditional Exports

Because all modules are optimized into their existing file locations, conditional resolutions are fully supported and optimized.

All custom condition names are supported, beyond the standard `"browser"`, `"react-native"`, `"development"`, `"production"`, `"require"` and `"import"` conditions.

Some build tools like Webpack and RollupJS support the custom `"module"` condition in exports. This condition is supported by JSPM as if it were a `"module"` entry in the exports field for the main entry point.

## Package Optimization

All packages on JSPM are optimized served with a RollupJS code splitting build.

Packages with only a main entry point will be built as a single module.

For packages with multiple entry points or subpaths, each of those package subpaths are optimized, with private non-public internal modules combined into chunks to minimize the number of dependencies loaded.

Source maps are included to map back to the unoptimized file structure.

To control which entry points are exposed in this way, the [`"exports"`](https://nodejs.org/dist/latest/docs/api/packages.html#subpath-exports) field can be used to define what is optimized by JSPM.

Packages without an `"exports"` field get their exports inferred by a [statistical analysis approach](/jspm-dev-release#subpath-detection). Whenever possible the `"exports"` field is the preferred way to define subpaths for published packages.

## CommonJS Compatibility

Any module which is not an ECMAScript module is treated as CommonJS. ECMAScript modules are detected as files ending in `.mjs`, `.js` files in a [`"type": "module"` package.json boundary](https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_package_json_type_field), or any `.js` file with `import` or `export` syntax.

The following CommonJS compatibility features are provided by the conversion process:

* All CommonJS modules are effectively converted into `export default module.exports` as an ECMAScript module. That is, they should always be imported as `import cjs from 'cjs'`, the default import sugar.
* Named exports for CommonJS modules are detected based on applying [CJS Module Lexer](https://github.com/guybedford/cjs-module-lexer). This uses a static analysis approach to determine the named exports of a CommonJS module. The `default` export will always remain the `module.exports` instance, even with this named exports assignment process.
* CommonJS modules in a cycle get a function-wrapper-based transform that ensures that the cycle references work out according to the CommonJS semantics.
* Comprehensive strict-mode conversion is applied to all CommonJS modules.
* `Buffer` and `process` globals are updated to reference the Browserify libraries for these.
* Any reference to `global` is rewritten to the actual environment global.
* `__filename` and `__dirname` references are rewritten using a `new URL('.', import.meta.url)` style expression.
* Dynamic `require()` and `require.resolve` rewriting is not currently supported.
* The `"browser"` field is supported for defining entry points, but only when the `"exports"` field is not set. `"exports"` field targets still run through `"browser"` field remappings for Webpack compatibility.

CommonJS should work the same as it does in Webpack and other JS bundlers. Any bugs can be reported to the main project [issue tracker](https://github.com/jspm/project).

## Overrides

Since CommonJS package optimization is based on statistically detecting their subpaths in JSPM, sometimes CommonJS packages won't support expected subpaths. There may also be sublte configuration errors in older packages.

To recover from errors like this, JSPM provides a [package overrides repo](https://github.com/jspm/overrides).

Entries made here override the package.json configuration for packages matching a given package name and version range, and enforce the `"exports"` configuration.

In addition a custom `"cjsNamedExports"` field is defined for JSPM specifically allowing specifying the expected CommonJS named exports for packages, bypassing the Node.js [cjs-module-lexer analysis](https://nodejs.org/dist/latest/docs/api/esm.html#commonjs-namespaces).

Creating a PR to add custom exports overrides allows for fixing any package issues on the CDNs.

For more information on the package exports field see the [Node.js documentation](https://nodejs.org/dist/latest-v16.x/docs/api/packages.html#packages_package_entry_points).

## Assets

JSPM will serve the readme, license and typing files as assets.

All other non-JavaScript assets will only be included if they are explicitly referenced using the `"exports"` field which will then make them availabile on the CDN, although assets do not support versioned redirects like JS modules so the exact version reference needs to be used (`https://ga.jspm.io/npm:pkg@x.y.z/path/to/asset`).

Wildcard exports (exports entries containing `*`) also support asset inclusion.

## system.jspm.io

[SystemJS](https://github.com/systemjs/systemjs) is a legacy module loader used by older applications without ES modules support by converting ES modules into the System module format.

A SystemJS layer of the `jspm.io` CDN is available at `https://ga.system.jspm.io`. The URL scheme and modules provided is exactly identical to the `https://ga.jspm.io` variant but with the exception that all ES modules are converted into SystemJS modules.

This enables turning any native ES module import map against `https://ga.jspm.io` into a SystemJS import map against `https://ga.system.jspm.io` and being able to load dependencies with the exact same execution semantics in all older browsers without modules support, the primary feature of the SystemJS project.

Import maps for SystemJS can also be constructed with [JSPM Generator](https://github.com/jspm/generator) setting `defaultProvider: 'jspm.io#system'` both [online](https://generator.jspm.io) and via the [API](https://github.com/jspm/generator).

> For questions or further discussion about JSPM, [join JSPM on Discord](https://discord.gg/dNRweUu).
