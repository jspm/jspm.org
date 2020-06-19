<div class="logobox"></div>

<h1 style="font-size: 6em; margin-top: 0.1em; margin-bottom: 0.5em;">jspm</h1>

<!-- <p style="text-align: center; margin-top: -5em; margin-bottom: 2em; font-size: 0.9em; padding-left: 14.5em;"><em>&nbsp;</em></p> -->

<p style="text-align: center;"><em>
jspm provides a module CDN allowing any package from npm to be directly loaded<br/>in the browser and other JS environments as a fully optimized native JavaScript module.
</em></p>

## jspm.dev

Load any npm library in the browser with module scripts:

```html
<script type="module">
  // Statically:
  import babel from 'https://jspm.dev/@babel/core';
  console.log(babel);

  // Dynamically:
  (async () => {
    console.log(await import('//jspm.dev/lodash@4/clone'));
  })();
</script>
```

[Try this example in the online sandbox](/sandbox#H4sIAAAAAAAAA02QPW7DMAyFd5+C9RI7g7V0yh8yNCdIL0BLbKxCFg1JcWIUvXv10wQZBFDv8X2kJNYVrOHbTyOc0aqe7/GepM9Be/BFArqTvAbycDrDyOpqYjlr3KTGdHZvimVYJoIhjOaQJS+dngIkdV+XUJ0dgK7rQsKT0oEdSFYUpZwSJVYQPavlP7JTegat9rVkG1BbcvVhJ6L48CXaGX1pyWXyS1Vg4klL5/RNMi430PON/QJej5NZ4Oq1vUDe8OZwmsil3URVCQHngEFLNGbZVLGbXYAeezLw5XiE1RDC5DdCpA/tFM3imF0h2dFqW8XlPRvqDF+abLTbTP1YLI4PbIN+sRKaFvYH+KkAXlN4Qx2gTG5WL4MMK/TD8V1Iw5ZWbST/tk1bdRKDHBpKsAeInGPXUOr5A5dD1mcAAgAA).

> June 19<sup>th</sup> 2020: The new jspm.dev CDN has been released, [read the release post](/jspm-dev-release), or scroll down for documentation.

## Features

_jspm provides an alternative to traditional JS build tooling without getting dragged down into npm installs and build configurations. Just import packages directly from JS and start hacking!_

* All modules on npm are converted into ES modules handling full [CommonJS compatibility](#commonjs-compatibility) including strict mode conversions.
* Packages are served [heavily optimized](#package-optimization) with RollupJS code splitting and dependency inlining, with the entire npm registry precomputed and served over Google Cloud CDN for global edge caching.
* All Node.js module loading semantics are supported including the new [package exports field](#exports-field).
* Exact versions are cached with far-future expires for optimal loading. Non-exact versions redirect to exact versions, with the redirects refreshed from the edge CDN to pick up version updates every few minutes.

## URL Patterns

All packages from [npm](https://www.npmjs.com/) are precomputed and served through jspm.dev and are avaialble at their corresponding URLs.

### Versions

To specify a specific package version target, the following URL versioning patterns are supported:

<table cellpadding="5">
<tr><th style="width: 12em" align=left>jspm.dev/pkg</th><td>Load the main entry point of a package at the latest version.</td></tr>
<tr><th align=left>jspm.dev/pkg@1</th><td>Load the latest ^1 release of the package (includes prereleases).</td></tr>
<tr><th align=left>jspm.dev/pkg@1.2</th><td>Load the latest ~1.2 release of the package (including prereleases).</td></tr>
<th align=left>jspm.dev/pkg@</th><td>Load the edge version of a package. This is the highest possible semver version including prereleases.<tr></td></tr>
<tr><th align=left>jspm.dev/pkg@tag</th><td>Load a tagged package version.</td></tr>
<tr><th align=left>jspm.dev/npm:pkg@1.2.3<br />jspm.dev/pkg@1.2.3</th><td>Load an exact version of a package. The explicit `npm:` registry identifier is optional, to avoid the automatic redirect that is added for forwards compatibility with new registries in future.</td></tr>
</table>

### Subpaths

Full subpath support is also provided for packages. It is a recommended best-practice to use package subpaths where possible to load specific package features instead of loading all package code when some of it might be unused:

<table cellpadding=5>
<tr><th style="width: 12em" align=left>jspm.dev/pkg/subpath</th><td>Load a subpath of a package - applies to all version patterns above.</td></tr>
</table>

Packages that have an [exports field](#exports-field) defined will expose the subpaths corresponding to the exports field. For packages without an exports field, a [statistical analysis](/jspm-dev-release#subpath-detection) process is used to determine the subpaths of a package in code splitting optimization.

<!-- For information about a package, including what exports subpaths are available, see its listing page:

<table cellpadding=5>
<tr><th style="width: 12em" align=left>jspm.dev/pkg/</th><td>Displays an information page for the package.</td></tr>
</table>

-->

## Import Maps

Including full URLs in every import, like `import 'https://jspm.dev/svelte@3'`, can become repetitive to maintain. [Package import maps](https://github.com/WICG/import-maps) are a specification allowing for defining package URLs in the browser.

With import maps you can define packages with the following HTML:

```html
<script type="importmap">
{
  "imports": {
    "svelte": "https://jspm.dev/svelte@3"
  }
}
</script>
```

then any module within that HTML page can import the package by name:

```js
// Statically:
import svelte from 'svelte';
// Or Dynamically:
import('svelte').then(react => console.log(react));
```

For packages with subpath modules, import maps also allow defining subpath maps:

```html
<script type="importmap">
{
  "imports": {
    "svelte": "https://jspm.dev/svelte@3",
    "svelte/": "https://jspm.dev/svelte@3/",
  }
}
</script>
```

which will then allow any subpaths to be imported by name:

```js
import store from 'svelte/store';
import compiler from 'svelte/compiler';
```

### Enabling Import Maps in Chrome

To enable import maps in a Chrome / Chromium browser, navigate to `chrome://flags`, or copy the URL below:

```
chrome://flags/#enable-experimental-web-platform-features
```

Select the **Experimental Web Platform Features** feature to **Enabled**, relaunch, and you're good to go.

### Polyfilling Import Maps with ES Module Shims

To support import maps in all modern browsers, [ES Module Shims](https://github.com/guybedford/es-module-shims) provides a performant shim based on a Web Assembly lexer for fast import specifier rewriting.

This can be included from jspm.dev with the followinng HTML, and the import map defined instead by `"importmap-shim"`:

```html
<script type="module" src="https://jspm.dev/es-module-shims"></script>
<script type="importmap-shim">
{
  "imports": {
    "svelte": "https://jspm.dev/svelte@3",
    "svelte/": "https://jspm.dev/svelte@3/",
  }
}
</script>
```

When using ES Module Shims, modules can be imported statically with `"type": "module-shim"` or dynamically with `importShim()`:

```html
<script type="module-shim">
  // Statically:
  import svelte from 'svelte';
  // Dynamically:
  importShim('svelte/store').then(store => console.log(store));
</script>
```

> ES Module Shims uses a very fast Wasm-based lexer for [rewriting JS import statements only](https://github.com/guybedford/es-module-shims#implementation-details) and will know to [skip jspm.dev source processing](https://github.com/guybedford/es-module-shims#skip-processing), resulting in a minimal performance cost.

## Package Optimization

All packages on jspm.dev are optimized with a RollupJS code splitting build, and this optimization has been [precomputed for all npm packages](/jspm-dev-release#building-all-of-npm).

Whenever a new package is published to npm it is immediately processed by jspm and made available on jspm.dev. This usually takes only a few minutes from the time of publishing.

Packages with only a main entry point will be loaded as a single module served at the direct URL of the package - `https://jspm.dev/npm:pkg@x.y.z`.

For packages with multiple entry points or subpaths, each of those package subpaths are optimized, with private non-public internal modules combined into chunks to minimize the number of dependencies loaded.

Source maps are included to map back to the unoptimized file structure.

To control which entry points are exposed in this way, the `"exports"` field can be used to define what is optimized by jspm.dev.

Packages without an `"exports"` field get their exports inferred by a [statistical analysis approach](/jspm-dev-release#subpath-detection). Whenever possible the `"exports"` field is the prferred way to define subpaths for published packages.

## Exports Field

Libraries published to npm can use the `"exports"` field to define what entry points to expose and to which environments, and jspm.dev will optimize these with a RollupJS code splitting build.

Exports support in jspm follows the exact features of the [Node.js ECMAScript modules implementation](https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_package_entry_points).

### Main Entry Point

The base case is to define the main entry point in exports in the package.json file via:

```json
{
  "exports": "./main.js"
}
```

If not using `"exports"`, jspm.dev will fall back to the `"main"`, like in Node.js.

> Both the leading `./` and the explicit file extension are important to include with the exports field.

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

The above will support `import 'pkg'` and `import 'pkg/feature'` for consumers in Node.js and the browser (or via `//jspm.dev/pkg` and `//jspm.dev/pkg/feature` if not using import maps with jspm.dev), and these separate entry points will then be optimized in a RollupJS code splitting build on jspm.dev.

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

jspm.dev will always resolve to the `"browser"`, `"development"`, `"default"` conditions in exports. `"require"` and `"import"` as appropriate, as these are defined for Node.js.

## Assets

jspm.dev will serve the readme, license and typing files as assets.

All other non-JavaScript assets will only be included if they are explicitly referenced using the `"exports"` field which will then make them availabile on the CDN, although assets do not support versioned redirects like JS modules so the exact version reference needs to be used (`https://jspm.dev/npm:pkg@x.y.z/path/to/asset`).

Folder exports (exports entries ending in `/`) also support asset inclusion.

## Development Workflows

If you have [Node.js installed](https://nodejs.org), a local server can be run with `npx http-server`, which is then the only step necessary to get going on a simple web application development workflow with native modules - no other tooling is required apart from a text editor.

Alternatively, by using new browsers like [Beaker Browser](https://beakerbrowser.com/) it can be possible to develop web applications in the browser itself without even needing any local CLI tooling at all (and of course you can do this with online editors too, but the decentralized web is far more fun).

These approaches can be a huge saving in avoiding wasted time on complex build tool configurations or starter projects in the early development phase of a web application.

The jspm [online sandbox](/sandbox) is entirely developed with this type of workflow using ES Module Shims, import maps, and jspm.dev. See the [very medicore source code here](https://github.com/jspm/jspm.org/blob/master/public_html/sandbox.html) (don't judge, it gets the job done... also PR's welcome!).

### TypeScript Workflow

TypeScript can be notoriously difficult to get to play nice with native modules in Node.js and browsers. This isn't meant to be a TypeScript tutorial, but here are some brief suggestions to make this process run more smoothly:

* `npm install typescript` and run `tsc -p .` or `tsc -p . --watch` to compile, storing this command in the package.json `"scripts": { "build": "tsc -p ." }` field to execute via `npm run build`, or however else you want to run it.
* Install the type for any dependency via `npm install @types/dep` or create a `src/deps.d.ts` file with manual `declare module 'dep';` entries to avoid dependency compilation errors.
* Set `allowSyntheticDefaultImports: true` for TypeScript to support importing CommonJS modules as `import cjs from 'cjs'`, which is the way they are recommended to be imported in Node.js and jspm.dev.
* When importing one TypeScript module from another, use an explicit `.js` file extension like `import './feature.js'` so that the output file references the exact file to work natively in Node.js and browsers (even though the file is actually at `lib/feature.ts`).
* Set up a `tsconfig.json` that compiles from a `src` dir to a `lib` dir for modern syntax with a configuration something like:

```json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "target": "es2017",
    "module": "esnext",
    "outDir": "lib"
  },
  "include": ["src/**/*.ts"]
}
```

Then run the `lib` version directly in the browser or Node.js for a fast universal workflow with good file watching support.

_Note: Using the CommonJS `"module"` output from TypeScript requires using completely different interop handling. In this case it's advisable to simply forget about trying to get any parity with native ES module semantics and focus on getting the CommonJS build to work, as it's almost impossible to do both with the same inputs. Pick one target or the other and stick with it._

> This same sort of src -> lib compilation workflow works well for Babel (`babel src --out-dir lib`) and other compilers. The benefit of single file-to-file transformation is that it supports ideal caching since the file mtimes can be checked to avoid rebuilds, unlike monolithic build processes which require custom cache stores for this.
> &nbsp;
> The other great thing about this type of workflow is that by following simple module semantics its very easy to add RollupJS as an optimization at the end while actually getting the optimal overall build time performance.

## Universal Module Semantics

When publishing packages to npm for support on jspm.dev, the basic rule for module semantics is that if it works in Node.js or in a browser then it should work on jspm.dev when published to npm.

Some guidelines for writing universal native ES modules:

* Use explicit file extensions when loading one module from another - `import './dep.js'` instead of `import './dep'`.
* When supporting Node.js, use the `.mjs` extension or set the [`"type": "module"` field](https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_package_json_type_field) in the package.json for native modules support.
* Use the package.json [`"exports"` field](#exports-field) to define the main entry point and other entry points of the package.
* When `"exports"` is not set, the `"main"` will be used, just like in Node.js. `"module"` is not supported as the semantics aren't tested against Node.js module semantics and would likely break many packages (eg due to named exports usage and interop scenarios that work in bundlers but do not work natively).
* It is recommended to import CommonJS modules as the default export - `import cjs from 'cjs'`. Named exports like `import { name } from 'cjs'` are supported for some CommonJS modules on jspm.dev, but whether Node.js will also support these [is still being discussed](https://github.com/nodejs/node/pull/33416).
* To reference asset files relative to the current module, use `new URL('./file.ext', import.meta.url)` to get its URL. This works in Node.js and browsers (and Deno).
* When accessing environment-specific globals like `process` in Node.js, always use a guard like `typeof process !== 'undefined'`as they won't necessarily be available in other environments. Ideally, rather import these modules where possible.

Only CommonJS modules will go through a conversion process on jspm.dev - ECMAScript module sources are left entirely as-is (although they will still be fully [optimized with RollupJS code splitting](#package-optimization)).

Modules are resolved as URLs, with the package.json `"dependencies"` field used to determine version ranges of package dependencies. Node.js builtin imports like `util` are replaced with optimized Browserify library references.

Only dependencies on npm are supported - for other registry types [custom private registry installations](/private-registries) can be requested.

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

CommonJS should work the same as it does in Browserify or Webpack. Any bugs can be reported to the main project [issue tracker](https://github.com/jspm/project).

> For questions or further discussion about jspm, [join jspm on Discord](https://discord.gg/dNRweUu).
