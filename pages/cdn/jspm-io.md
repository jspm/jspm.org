+++
title = "jspm.io"
description = "jspm.io Native Modules CDN"
prev-section = "docs/integrations"
+++

# jspm.io <br />Import Maps CDN

`jspm.io` is a CDN built to support import maps with maximum performance featuring:

* Comprehensive [package optimization](#package-optimization) and minification with source maps.
* Universal URLs with far-future expires _for all resources_.
* The ability to configure all environment conditions for a package, compatible with [Node.js exports conditions](https://nodejs.org/dist/latest-v19.x/docs/api/packages.html#conditional-exports) and [WinterCG runtime keys](https://runtime-keys.proposal.wintercg.org/) (eg `"development"` / `"production"` / `"browser"` / `"node"` / `"deno"` package entry point variants).
* High performance CDN, with redundant storage and caching layers and 99.99% historical [uptime](https://status.jspm.io/).

## Package Interpretation

Packages on the JSPM CDN are processed to be import maps and browser-compatible based on standard module semantics that have emerged between Node.js and browsers.

The [Node.js ES Modules](https://nodejs.org/dist/latest/docs/api/esm.html) conventions in Node.js are fully supported, alongside the Node.js [package definitions](https://nodejs.org/dist/latest/docs/api/packages.html).

This includes support for the package exports field, package imports field, own name resolution, conditional exports definitions, as well as the conversion of CommonJS modules into ES modules.

### URLs

Imports on the CDN are based on using exact file extensions when loading relative paths, and using import maps for bare specifier resolutions.

The `jspm.io` CDN is fully versioned. The current version is _version gamma_: `https://ga.jspm.io`.

This versioning scheme allows immutable caching with far-future expires while still being able to ship major CDN releases over time.

Packages are located at their exact registry and version URL known as the canonical package path: `https://ga.jspm.io/npm:pkg@x.y.z/`.

### package.json

All packages contain a `package.json` file, which is the processed package.json by JSPM including the enumerated exports and file listing. The `package.json` is all that is needed to enumerate the exports of a package and resolve their URLs in the package.

This is exactly what the JSPM generator does as a linker supporting the modern module resolver conventions. Files within the package are typically provided by their original file path, although names are sometimes rewritten, for example when constructing development builds for some modules.

### Exports Field

Libraries published to npm can use the `"exports"` field to define what entry points to expose and to which environments, and JSPM will optimize these with a RollupJS code splitting build.

Exports support in JSPM follows the exact features of the [Node.js ECMAScript modules implementation](https://nodejs.org/dist/latest-v15.x/docs/api/esm.html#esm_package_entry_points).

### Main Entry Point

The base case is to define the main entry point in exports in the package.json file via:

```json
{
  "exports": "./main.js"
}
```

If not using `"exports"`, JSPM will fall back to the `"main"`, like in Node.js and other build tools.

> Both the leading `./` and the explicit file extension are important to include when using the exports field.

### Multiple Entry Points

If there are multiple entry points, these can be defined as a map, with the `"."` export for the main:

```json
{
  "exports": {
    ".": "./main.js",
    "./feature": "./feature.js"
  }
}
```

The above will support `import 'pkg'` and `import 'pkg/feature'` for consumers in Node.js and the browser, and these separate entry points will then be optimized in a RollupJS code splitting build on JSPM.

> Any entry points not explicitly defined in `"exports"` will throw when attempting to be imported in Node.js. That is, the `"exports"` field fully encapsulates the package. It is exactly this encapsulation of the private modules of the package that makes it possible to safely optimize the package by merging these internal modules with a RollupJS code splitting build.

### Conditional Exports

To use a different main entry point between Node.js and other environments this can be written:

```json
{
  "exports": {
    "node": "./main-node.js",
    "default": "./main-not-node.js"
  }
}
```

There is also a `"browser"` condition, but the benefit of using a `"default"` fallback above is that it can also work in e.g. Deno, or other JS environments.

Conditional exports also apply to multiple entry points:

```json
{
  "exports": {
    ".": {
      "node": "./main-node.js",
      "default": "./main-not-node.js"
    }
    "./feature": {
      "node": "./feature.js",
      "default": "./feature-not-node.js"
    }
  }
}
```

Other conditions that can be used include `"browser"`, `"react-native"`, `"development"`, `"production"`, `"require"` and `"import"`.

Some build tools like Webpack and RollupJS support the custom `"module"` condition in exports. This condition is supported by JSPM as if it were a `"module"` entry in the exports field for the main entry point.

## Package Optimization

All packages on JSPM are optimized served with a RollupJS code splitting build.

Packages with only a main entry point will be built as a single module.

For packages with multiple entry points or subpaths, each of those package subpaths are optimized, with private non-public internal modules combined into chunks to minimize the number of dependencies loaded.

Source maps are included to map back to the unoptimized file structure.

To control which entry points are exposed in this way, the `"exports"` field can be used to define what is optimized by JSPM.

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
* The `"browser"` field is supported as it is in Browserify, but is not supported when the `"exports"` field is set.

CommonJS should work the same as it does in Webpack and other JS bundlers. Any bugs can be reported to the main project [issue tracker](https://github.com/jspm/project).

## Assets

JSPM will serve the readme, license and typing files as assets.

All other non-JavaScript assets will only be included if they are explicitly referenced using the `"exports"` field which will then make them availabile on the CDN, although assets do not support versioned redirects like JS modules so the exact version reference needs to be used (`https://jspm.dev/npm:pkg@x.y.z/path/to/asset`).

Wildcard exports (exports entries containing `*`) also support asset inclusion.

## system.jspm.io

[SystemJS](https://github.com/systemjs/systemjs) is a legacy module loader used by older applications without ES modules support by converting ES modules into the System module format.

A SystemJS layer of the `jspm.io` CDN is available at `https://ga.system.jspm.io`. The URL scheme and modules provided is exactly identical to the `https://ga.jspm.io` variant but with the exception that all ES modules are converted into SystemJS modules.

This enables turning any native ES module import map against `https://ga.jspm.io` into a SystemJS import map against `https://ga.system.jspm.io` and being able to load dependencies with the exact same execution semantics in all older browsers without modules support, the primary feature of the SystemJS project.

Import maps for SystemJS can also be constructed with [JSPM Generator](https://github.com/jspm/generator) setting `defaultProvider: 'jspm.io#system'` both [online](https://generator.jspm.io) and via the [API](https://github.com/jspm/generator).

> For questions or further discussion about JSPM, [join JSPM on Discord](https://discord.gg/dNRweUu).
