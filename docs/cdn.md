# Native ES Module CDN

JSPM provides two primary modules CDNs - `jspm.io`, a highly optimized CDN for import maps from development to production, and `jspm.dev` a CDN for quick development prototyping.

Both CDNs follow the exact same module semantics as descibed in the [CDN semantics](#module-cdn-semantics) section below.

## Import Maps CDN

`jspm.io` is a CDN built to support import maps with maximum performance featuring:

* Comprehensive [package optimization](#package-optimization) and minification with source maps.
* Univeral URLs with far-future expires _for all resources_.
* The ability to configure all environment conditions for a package (eg development / production / browser / Node.js package variants).
* SystemJS variant to support older browsers without needing an import maps polyfill.
* High performance CDN, using Google Cloud CDN and Cloud Storage - no custom code lies between `ga.jspm.io` and Google's Cloud CDN, HTTPS Load Balancer and Storage - the uptime guarantees are the direct Google Cloud uptime SLA guarantees. See for example [any popular CDN comparison](https://www.cdnperf.com/cdn-compare?type=performance&location=world&cdn=aws-cloudfront-cdn,cloudflare-cdn,google-cloud-cdn) to see how Google compares here.

Import map CDNs have a huge caching benefit because we can both treat all URLs as immutable with far-future expires, while still giving each package a unique URL that can be shared even as its dependencies are updated.

This maximises the cache usage of packages - shipping an update of your application doesn't require your users to re-download the entire application build. Their browser caches will maintain the exact dependency versions from the last update, making incremental updates highly performant. It's like the difference between running `npm update react` and a full `npm install` from fresh.

Treating packages as the unit of optimization also means that the import map itself becomes the version lock in the browser providing the guarantee that the application will continue to behave the same today as tomorrow since the contract with the module CDN is clear.

For support in older browsers there are two options provided - firstly by default, [ES Module Shims](https://github.com/guybedford/es-module-shims) is included, a fast Wasm-based [polyfill for import maps](#import-maps-polyfill) that works on top of basic native modules support supported in the majority of browsers.

Then secondly, for compatibility in all older browsers SystemJS is supported in all JSPM workflows, using the [SystemJS CDN variant](#systemjs-variant) (ga.system.jspm.io), which provides an incredibly fast alternative to native modules supported in all browsers while providing the exact same semantics support through its module format.

## JSPM Generator

The best way to try out the `jspm.io` CDN is by using the [online import maps generator](https://generator.jspm.io).

The generator takes as input a list of package dependencies, versions, subpaths and output options and returns the complete import map against the `jspm.io` CDN.

The resultant import map can be directly included in any HTML page where local modules can then import the mapped dependencies by name.

_This import map is all that is needed to work with dependencies in native modules workflows in browsers, allowing you to get back to focusing on just running your own code natively in the browser, instead of needing to configure complex build tools and package management systems._

> Try out one of the [example workflows](/docs/workflows) for a full example.

The formats supported for adding a dependency in the generator "add dependency" box are:

* react
* lit-element@2
* lodash/sort

Individual package exports are installed separately as they are separate entries in the import map.

Once a dependency has been added, the UI allows changing the dependency version or adding or removing [package exports](#exports-field) from the import map. By default if no subpath is added initially, only the main entry point for the package will be added to the import map. Each line of the import map `"imports"` section corresponds to a single dependency version and exports subpath in the dependencies bar.

The bottom left of the sidebar allows configuring the [conditional exports](#conditional-exports) environment resolution from the environment panel, allowing for choosing e.g. the production or development variants of packages.

The import map generated can be downloaded or copied directly into an HTML application.

By default the [import maps polyfill](/docs/workflows#import-maps-polyfill) is embedded in the provided source HTML as well. Alternatively a [SystemJS Import Map](/docs/workflows#systemjs) can be generated instead to support older browsers even without any native modules support.

### URLs

The `jspm.io` CDN is fully versioned. The current version is _version gamma_: `https://ga.jspm.io`.

This versioning scheme allows immutable caching with far-future expires while still being able to ship major CDN releases over time.

Packages are located at their exact registry and version URL known as the canonical package path: `https://ga.jspm.io/npm:pkg@x.y.z/`.

All packages contain a `package.json` file, which is the processed package.json by JSPM including the enumerated exports and file listing. The `package.json` is all that is needed to enumerate the exports of a package and resolve their URLs in the package. This is exactly what the online generator does and is an important feature of the modern module resolver conventions. Files within the package are typically provided by their original file path, although names are sometimes rewritten, for example when constructing development builds for some modules.

### Import Maps Polyfill

Import maps are only supported in the very latest version of Chrome, so to support import maps in all other modules browsers we use [ES Module Shims](https://github.com/guybedford/es-module-shims), a performant shim based on a Web Assembly lexer for fast import specifier rewriting.

This can be included from JSPM with the following HTML, which is included by default in the JSPM generator output:

```html
<script async src="https://ga.jspm.io/npm:es-module-shims@0.10.1/dist/es-module-shims.min.js"></script>
```

### SystemJS Variant

A SystemJS variant of the `jspm.io` CDN is available at `https://ga.system.jspm.io`. The URL scheme and modules provided is exactly identical to the `https://ga.jspm.io` variant but with the exception that all ES modules are converted into SystemJS modules.

This enables turning any native ES module import map against `https://ga.jspm.io` into a SystemJS import map against `https://ga.system.jspm.io` and being able to load dependencies with the exact same execution semantics in all older browsers without modules support, the primary feature of the SystemJS project.

Import maps for SystemJS can be constructed via [JSPM Generator](https://generator.jspm.io).

> For more information on SystemJS workflows, [see the SystemJS workflow guide](/docs/workflows#systemjs).

## jspm.dev

`jspm.dev` provides a modules CDN that does not require import maps, useful for quick prototyping in development, as any module can be loaded directly from the console or in a module script without any other steps being necessary.

To load any npm library in the browser with module scripts with `jspm.dev` try for example:

```html
<script type="module">
  // Statically:
  import babel from 'https://jspm.dev/@babel/core';
  console.log(babel);

  // Dynamically:
  console.log(await import('//jspm.dev/lodash@4/clone'));
</script>
```

### Version URLs

To specify a specific package version target, the following URL versioning patterns are supported:

<table cellpadding="5">
<tr><th style="width: 12em" align=left>jspm.dev/pkg</th><td>Load the main entry point of a package at the latest version.</td></tr>
<tr><th align=left>jspm.dev/pkg@1</th><td>Load the latest ^1 release of the package (includes prereleases).</td></tr>
<tr><th align=left>jspm.dev/pkg@1.2</th><td>Load the latest ~1.2 release of the package (including prereleases).</td></tr>
<th align=left>jspm.dev/pkg@</th><td>Load the edge version of a package. This is the highest possible semver version including prereleases.<tr></td></tr>
<tr><th align=left>jspm.dev/pkg@tag</th><td>Load a tagged package version.</td></tr>
<tr><th align=left>jspm.dev/npm:pkg@1.2.3<br />jspm.dev/pkg@1.2.3</th><td>Load an exact version of a package. The explicit `npm:` registry identifier is optional, to avoid the automatic redirect that is added for forwards compatibility with new registries in future.</td></tr>
</table>

Exact version URLs are cached with far-future expires, while non-exact version URLs are cached with a short expiry to allow dependency updates over time.

Note that only the version of the initial package being requested is being set this way, while the versions of deep dependencies will follow semver resolution.

### Subpaths

Full subpath support is also provided for packages. It is a recommended best practice to use package subpaths where possible to load specific package features, instead of loading all package code when some of it might be unused:

<table cellpadding=5>
<tr><th style="width: 12em" align=left>jspm.dev/pkg/subpath</th><td>Load a subpath of a package - applies to all version patterns above.</td></tr>
</table>

Packages that have an [exports field](#exports-field) defined will expose the subpaths corresponding to the exports field. For packages without an exports field, a [statistical analysis](/jspm-dev-release#subpath-detection) process is used to determine the subpaths of a package in code splitting optimization.

### Environment Conditions

`jspm.dev` will always serve modules using the `"development"`, and `"browser"` [exports conditions](#conditional-exports).

As a result packges like React or Lit will run in their development modes, which may include a console message about this.

If needing to customize the environment, use `jspm.io` instead, which allows setting the conditional environment via the import map.

## Module CDN Semantics

The way in which JSPM will interpret and optimize packages is based on the common modules semantics between Node.js and browsers.

For the most part these build on top of the [Node.js ES Modules](https://nodejs.org/dist/latest-v15.x/docs/api/esm.html) and [package semantics](https://nodejs.org/dist/latest-v15.x/docs/api/packages.html) as well as the native browser semantics, and are based on a sort of common subset of behaviours between these and current JS ecosystem tooling.

### Package Optimization

All packages on JSPM are optimized served with a RollupJS code splitting build.

Packages with only a main entry point will be built as a single module.

For packages with multiple entry points or subpaths, each of those package subpaths are optimized, with private non-public internal modules combined into chunks to minimize the number of dependencies loaded.

Source maps are included to map back to the unoptimized file structure.

To control which entry points are exposed in this way, the `"exports"` field can be used to define what is optimized by JSPM.

Packages without an `"exports"` field get their exports inferred by a [statistical analysis approach](/jspm-dev-release#subpath-detection). Whenever possible the `"exports"` field is the preferred way to define subpaths for published packages.

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

Some build tools like Webpack and RollupJS support the custom `"module"` condition in exports. This condition is not supported by JSPM because JSPM aims to replicate _runtime semantics_, while the `"module"` condition is considered a build-tool-only condition that would never be supported in Node.js itself. The idea of such a condition thus does not make sense in the context of JSPM. Typically these tools use this condition in order to replace a CommonJS `require('mod')` with an ES module if there is a `"module"` condition entry for `"mod"` during the build, since they want to avoid having a separate ESM and CJS build. This is considered by JSPM to be breaking against the Node.js semantics though, since JSPM always seeks to replicate Node.js runtime semantics.

### Universal Module Semantics

When publishing packages to npm for support on JSPM, the basic rule for the module semantics is that if it works in Node.js or in a browser then it should work in JSPM when published to npm.

Some guidelines for writing universal native ES modules:

* Use explicit file extensions when loading one module from another - `import './dep.js'` instead of `import './dep'`.
* When supporting Node.js, use the `.mjs` extension or set the [`"type": "module"` field](https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_package_json_type_field) in the package.json for native modules support.
* Use the package.json [`"exports"` field](#exports-field) to define the main entry point and other entry points of the package.
* When `"exports"` is not set, the `"main"` will be used, just like in Node.js. `"module"` is not supported as the semantics aren't tested against Node.js module semantics and would likely break many packages (eg due to named exports usage and interop scenarios that work in bundlers but do not work natively).
* It is recommended to import CommonJS modules as the default export - `import cjs from 'cjs'`. Named exports like `import { name } from 'cjs'` are supported for some CommonJS modules on JSPM, based on the same [static analysis system used by Node.js](https://github.com/guybedford/cjs-module-lexer).
* To reference asset files relative to the current module, use `new URL('./file.ext', import.meta.url)` to get its URL. This works in Node.js and browsers (and Deno).
* When accessing environment-specific globals like `process` in Node.js, always use a guard like `typeof process !== 'undefined'`as they won't necessarily be available in other environments. Ideally, rather import these modules where possible - `import process from 'process'`.

Only CommonJS modules will go through a semantic conversion process on JSPM - ECMAScript module sources are left entirely as-is (although they will still be fully [optimized with RollupJS code splitting](#package-optimization)).

Modules are resolved as URLs, with the package.json `"dependencies"` field used to determine version ranges of package dependencies. Node.js builtin imports like `util` are replaced with optimized Browserify library references.

Only dependencies on npm are supported. New registries may be supported in future or for other registry types. Custom private registry installations could be requested.

### Assets

JSPM will serve the readme, license and typing files as assets.

All other non-JavaScript assets will only be included if they are explicitly referenced using the `"exports"` field which will then make them availabile on the CDN, although assets do not support versioned redirects like JS modules so the exact version reference needs to be used (`https://jspm.dev/npm:pkg@x.y.z/path/to/asset`).

Wildcard exports (exports entries containing `*`) also support asset inclusion.

### CommonJS Compatibility

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

> For questions or further discussion about JSPM, [join JSPM on Discord](https://discord.gg/dNRweUu).

<a style="display:block;padding-top:1em;width:19em;margin-left:auto;margin-right:auto;text-decoration:none;" href="https://cloud.google.com">
<p style="line-height: 2em; vertical-align:center;font-weight:bold;float:left;">Running on</p>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 181 28" style="height:2em;float:right;padding-left:1em;margin-top:1em;"><defs><style>.cls-1{fill:#ea4335;}.cls-2{fill:#4285f4;}.cls-3{fill:#34a853;}.cls-4{fill:#fbbc05;}.cls-5{fill:#5f6368;}</style></defs><path class="cls-1" d="M21.85,7.41l1,0,2.85-2.85.14-1.21A12.81,12.81,0,0,0,5,9.6a1.55,1.55,0,0,1,1-.06l5.7-.94s.29-.48.44-.45a7.11,7.11,0,0,1,9.73-.74Z"/><path class="cls-2" d="M29.76,9.6a12.84,12.84,0,0,0-3.87-6.24l-4,4A7.11,7.11,0,0,1,24.5,13v.71a3.56,3.56,0,1,1,0,7.12H17.38l-.71.72v4.27l.71.71H24.5A9.26,9.26,0,0,0,29.76,9.6Z"/><path class="cls-3" d="M10.25,26.49h7.12v-5.7H10.25a3.54,3.54,0,0,1-1.47-.32l-1,.31L4.91,23.63l-.25,1A9.21,9.21,0,0,0,10.25,26.49Z"/><path class="cls-4" d="M10.25,8A9.26,9.26,0,0,0,4.66,24.6l4.13-4.13a3.56,3.56,0,1,1,4.71-4.71l4.13-4.13A9.25,9.25,0,0,0,10.25,8Z"/><path class="cls-5" d="M52.79,22.51a9.11,9.11,0,0,1-6.6-2.71,8.8,8.8,0,0,1-2.77-6.52,8.81,8.81,0,0,1,2.77-6.52A9.11,9.11,0,0,1,52.79,4a8.84,8.84,0,0,1,6.33,2.55L57.34,8.36a6.41,6.41,0,0,0-4.55-1.8,6.34,6.34,0,0,0-4.7,2,6.53,6.53,0,0,0-1.93,4.75A6.53,6.53,0,0,0,48.09,18a6.71,6.71,0,0,0,9.36.11A5.32,5.32,0,0,0,58.82,15h-6V12.44h8.49A8.12,8.12,0,0,1,61.41,14a8,8,0,0,1-2.19,5.9A8.51,8.51,0,0,1,52.79,22.51Zm19.74-1.7a6.12,6.12,0,0,1-8.47,0,5.7,5.7,0,0,1-1.73-4.25,5.71,5.71,0,0,1,1.73-4.25,6.13,6.13,0,0,1,8.47,0,5.71,5.71,0,0,1,1.73,4.25A5.7,5.7,0,0,1,72.52,20.81Zm-6.6-1.67a3.24,3.24,0,0,0,4.73,0,3.56,3.56,0,0,0,1-2.58,3.57,3.57,0,0,0-1-2.59,3.29,3.29,0,0,0-4.75,0,3.57,3.57,0,0,0-1,2.59A3.56,3.56,0,0,0,65.92,19.14Zm19.62,1.67a6.12,6.12,0,0,1-8.47,0,5.7,5.7,0,0,1-1.73-4.25,5.71,5.71,0,0,1,1.73-4.25,6.12,6.12,0,0,1,8.47,0,5.71,5.71,0,0,1,1.73,4.25A5.7,5.7,0,0,1,85.55,20.81Zm-6.6-1.67a3.24,3.24,0,0,0,4.73,0,3.56,3.56,0,0,0,1-2.58,3.57,3.57,0,0,0-1-2.59,3.29,3.29,0,0,0-4.75,0,3.57,3.57,0,0,0-1,2.59A3.56,3.56,0,0,0,78.94,19.14Zm15.16,8.71a5.24,5.24,0,0,1-3.33-1.06,6.13,6.13,0,0,1-1.94-2.46l2.28-.95a3.84,3.84,0,0,0,1.13,1.49,2.85,2.85,0,0,0,1.87.63,3,3,0,0,0,2.33-.9A3.65,3.65,0,0,0,97.28,22v-.86h-.09a3.81,3.81,0,0,1-3.13,1.35,5.43,5.43,0,0,1-4-1.74,5.75,5.75,0,0,1-1.71-4.19,5.81,5.81,0,0,1,1.71-4.22,5.42,5.42,0,0,1,4-1.75A4.3,4.3,0,0,1,95.9,11a3.7,3.7,0,0,1,1.3.95h.09V11h2.48V21.65a6.21,6.21,0,0,1-1.59,4.65A5.6,5.6,0,0,1,94.11,27.85Zm.18-7.68a2.91,2.91,0,0,0,2.26-1,3.7,3.7,0,0,0,.91-2.56A3.78,3.78,0,0,0,96.55,14a2.9,2.9,0,0,0-2.26-1,3.09,3.09,0,0,0-2.34,1,3.65,3.65,0,0,0-1,2.59,3.58,3.58,0,0,0,1,2.56A3.1,3.1,0,0,0,94.29,20.17Zm9.89-15.5V22.15h-2.61V4.67Zm7.16,17.84a5.68,5.68,0,0,1-4.21-1.71,5.79,5.79,0,0,1-1.69-4.24,5.86,5.86,0,0,1,1.63-4.28,5.36,5.36,0,0,1,4-1.67,5.05,5.05,0,0,1,2,.39,4.71,4.71,0,0,1,1.53,1,7,7,0,0,1,1,1.21,7.15,7.15,0,0,1,.59,1.17l.27.68-8,3.29a3,3,0,0,0,2.88,1.8,3.41,3.41,0,0,0,2.93-1.65l2,1.35a6.59,6.59,0,0,1-1.92,1.82A5.44,5.44,0,0,1,111.34,22.51ZM108,16.38l5.32-2.21a1.84,1.84,0,0,0-.83-.91,2.71,2.71,0,0,0-1.37-.35,3.09,3.09,0,0,0-2.15.95A3.17,3.17,0,0,0,108,16.38Z"/><path class="cls-5" d="M130.13,22.51a8.24,8.24,0,0,1-8.38-8.43,8.24,8.24,0,0,1,8.38-8.43,7.46,7.46,0,0,1,5.93,2.64l-1.44,1.4a5.44,5.44,0,0,0-4.48-2.05,6.11,6.11,0,0,0-4.45,1.78,6.24,6.24,0,0,0-1.81,4.66,6.24,6.24,0,0,0,1.81,4.66,6.11,6.11,0,0,0,4.45,1.78,6.36,6.36,0,0,0,5-2.34l1.44,1.44a7.86,7.86,0,0,1-2.77,2.11A8.48,8.48,0,0,1,130.13,22.51Z"/><path class="cls-5" d="M140.45,22.15h-2.07V6h2.07Z"/><path class="cls-5" d="M143.83,12.43a5.79,5.79,0,0,1,8.16,0,5.85,5.85,0,0,1,1.6,4.2,5.85,5.85,0,0,1-1.6,4.2,5.79,5.79,0,0,1-8.16,0,5.85,5.85,0,0,1-1.6-4.2A5.85,5.85,0,0,1,143.83,12.43Zm1.54,7.1a3.49,3.49,0,0,0,5.07,0,4,4,0,0,0,1.07-2.9,4,4,0,0,0-1.07-2.9,3.49,3.49,0,0,0-5.07,0,4,4,0,0,0-1.07,2.9A4,4,0,0,0,145.38,19.52Z"/><path class="cls-5" d="M165.06,22.15h-2V20.62H163A3.85,3.85,0,0,1,161.54,22a4.08,4.08,0,0,1-2.05.55,3.89,3.89,0,0,1-3.14-1.26,5,5,0,0,1-1.07-3.38V11.11h2.07v6.42q0,3.09,2.73,3.09a2.54,2.54,0,0,0,2.1-1,3.77,3.77,0,0,0,.81-2.39V11.11h2.07Z"/><path class="cls-5" d="M172.09,22.51a4.86,4.86,0,0,1-3.7-1.69,6,6,0,0,1-1.55-4.19,6,6,0,0,1,1.55-4.19,4.86,4.86,0,0,1,3.7-1.69,4.69,4.69,0,0,1,2.26.54,3.83,3.83,0,0,1,1.5,1.35h.09l-.09-1.53V6h2.07V22.15h-2V20.62h-.09a3.83,3.83,0,0,1-1.5,1.35A4.69,4.69,0,0,1,172.09,22.51Zm.34-1.89a3.3,3.3,0,0,0,2.49-1.08,4.05,4.05,0,0,0,1-2.91,4.05,4.05,0,0,0-1-2.91,3.38,3.38,0,0,0-5,0,4,4,0,0,0-1,2.9,4,4,0,0,0,1,2.9A3.3,3.3,0,0,0,172.43,20.62Z"/></svg>
</a>
