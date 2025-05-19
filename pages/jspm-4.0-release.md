+++
title = "JSPM 4.0 Release"
description = "Discussing development and trust models for import map services"
+++

# JSPM 4.0 Release

JSPM 4.0 is now out, featuring a new opinionated standards-based workflow that puts convention over configuration. It provides an alternative modern workflow for working with native ESM workflows in the browser using import maps:

* `jspm install` without any arguments creates the `importmap.js` file.
* `jspm serve` behaves as a static server except for supporting TypeScript type stripping and hot reloading.
* `jspm build` uses the same semantics as the above commands to provide zero config standards-based builds.

Read the updated [Getting Started](/getting-started) guide for more info, or continue reading below for the background on how this release came together.

## Standards Based Workflows

Leaning into standards means that developers can focus on writing JavaScript without learning custom build toolchains or frameworks. The JSPM 4.0 workflow takes advantage of the latest browser capabilities:

1. **Native ES Modules**: Use standard import/export syntax without transpilation
2. **Import Maps**: Handle dependency mapping directly in the browser
3. **TypeScript Type Stripping**: TypeScript type stripping as the only code transform
4. **No Custom Loaders**: Everything runs on standard browser semantics

This standards-first approach has several major benefits:

* **Simplified Debugging**: Browser DevTools work naturally with standard modules, no source maps needed
* **Portable Code**: Fewer framework-specific conventions means easier migration
* **Future-Proof**: As standards evolve, your code remains compliant
* **Reduced Tooling**: Less configuration, fewer build steps, and smaller bundles
* **Instant Development**: JSPM import maps can even be generated in the browser for instant sandbox workflows, a technique used by Framer, one of the major project sponsors.

## Import Map Package Management

One of the major changes in JSPM 4.0 is import maps are now treated as package management artifacts more like lock files than manifests for hand-editing.

All package management operations output by default to the new `importmap.js` import map injection script file. This is effectively a workaround for the lack of external import map support for an `importmap.json` file in browsers. The injection script has been recently widely support thanks to the new support for multiple import maps:

```html
<script type="importmap" src="https://site.com/importmap.json"></script>
<script type="module">import 'app'</script>
```

The injection script itself then directly inlines the new import map into the browser:

```js
(map => {
  document.head.appendChild(Object.assign(document.createElement("script"), {
    type: "importmap",
    innerHTML: JSON.stringify(map)
  }));
})
({
  "imports": {
    "my-app": "./src/index.js"
    // ... imports
  },
  "scopes": {
    // ... scopes
  }
});
```

With the above, using just native browser semantics it is possible to run any browser application instantly.

## Package.json is the Manifest

Instead of hand-editing the `importmap.js` file, JSPM now figures out what dependencies are needed and at what versions and updates the map.

The information for how to link the application, and what dependency constraints is then taken from the local `package.json` file.

The key idea here is that we can define the application entry points from the package.json using the `"name"` and `"exports"` package.json fields.

For example, for a package.json containing:

```json
{
  "name": "my-app",
  "exports": {
    ".": "./src/index.js"
  },
  "dependencies": {
    "foo": "1.2.3"
  }
}
```

JSPM will know when the user runs `jspm install` that there should be a `"my-app"` import in the import map pointing to `"./src/index.js"`.

It will then link (_trace_) that entry point and its dependencies in turn, populating dependencies into scopes while respecting the package.json `"dependencies"` resolution ranges.

As a result, the only imports at the top-level `"imports"` of the import map will be the enumerated `"exports"` entry points (which also support subpath patterns).

**It was surprisingly hard to figure out good import map ergonomics for the project but this is a huge simplication that forms the new convention for the project going forward.**

Of course we still support `--out`, `--map` and `--resolution` flags (amongs [others](/docs/cli/interfaces/GenerateFlags)) for custom map inputs and outputs including JSON and HTML outputs as previously. `jspm link` is also still supported for the more complex map manipulation workflows. But the important point here is that if we get past treating maps as a user-based manifest and let JSPM act as the linker that figures it out based on constraints, we get some really great ergonomics out of import maps development.

## Hot Reloading Server

The JSPM 4.0 server (`jspm serve`) provides a development environment with instant hot module reloading built off the same conventions as install:

* **Zero Configuration**: Start serving your application with a single command.
* **Fast Refresh**: Changes to your code are reflected instantly in the browser.
* **TypeScript Support**: Write TypeScript without a separate build step.
* **Import Map Awareness**: Handles import map updates without refreshes.

The hot reloading system works by injecting a Server Side Events connection into the import map injection script itself. When files change, the server notifies the client and ES Module Shims handles the reloading of only the affected modules, preserving application state supporting the `import.meta.hot` API.

> The hot reloading server is made possible by [ES Module Shims](https://github.com/guybedford/es-module-shims), which is used in JSPM to polyfill import map features in older browsers like multiple import maps support, recently adding support for hot reloading.

## Building for Production

The semantics of `jspm build` follow from the same standards-based runtime semantics.

_Then, instead of building the `dist` folder inside the package, we build the whole package, and output the new optimized package into the `dist` folder._

This is very much the same thing as what the JSPM.IO CDN already does today for npm packages, but available locally.

What makes this possible is clearly defining the application entry points, which we enforce from the start with `jspm install`, so that the package optimization is fully well defined without having to set the build entry points.

## CDN Trust Models and Future Direction

The core ergonomics of JSPM 4.0 still rely heavily on CDNs providing optimized packages for seamless import map generation. In-browser workflows are supported just as well as local CLI workflows, and the AI sandbox use cases with module CDNs are important to support.

To give some background - the first versions of JSPM focused primarily on local packagae semantics but ultimately fell short on standards-based workflows, when custom loaders were required that created friction in the developer experience.

Solving the CDN provider ecosystem ergonomics first Since JSPM 4.0, we've dramatically shifted our approach to solving the CDN provider ecosystem first. The JSPM generator now supports multiple CDN providers (jspm.io, unpkg, jsdelivr, skypack, and others), giving developers the freedom to choose their provider or even mix providers within a single import map. This provider-agnostic approach directly addresses the lock-in problem that has historically been a concern with CDN-based workflows.

`jspm.io` itself, as a module CDN provider, has been adopted by frameworks such as Rails and is used internally in Framer Sites for instant in-browser code loading. However, we recognize that trust and security remain critical considerations. Our roadmap for the future centers around three key principles to build a trustless module ecosystem:

1. **Permanent URLs**: Ensuring content-addressable, immutable package URLs that can be reliably cached and verified
2. **Integrity Support**: Working with browser vendors on full import map integrity support (see [JavaScript Integrity Manifests with Import Maps](/js-integrity-with-import-maps))
3. **Provider Interchangeability**: Continuing to improve standards and conventions that make switching CDN providers seamless. Clear conventions and standards here is the key to avoiding lock-in.

The JSPM Foundation aims to contribute to this trustless infrastructure for module delivery based on the sponsorships we receive, while developing the open source tooling that treats module CDNs as interchangeable providers. While we've made significant progress with JSPM 4.0, tackling the trust problem comprehensively remains a major future goal for the project.

As we continue to build out these standards and tools for native modules, our hope is that the broader ecosystem will embrace clear conventions around verifiability and integrity as essential foundations for the future of code execution on the web.
