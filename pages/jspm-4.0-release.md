+++
title = "JSPM 4.0 Release"
description = "JSPM 4.0 release post featuring a refreshed local development workflow for modern standards"
+++

# JSPM 4.0 Release

JSPM 4.0 is now out, featuring a refreshed and opinionated standards-based workflow based on convention over configuration. It provides a modern workflow for working with native ESM in the browser using import maps:

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

* **Simplified Debugging**: Browsers, tools and development tooling all work naturally with standard modules, no source maps needed
* **Portable Code**: Fewer framework-specific conventions means easier migration
* **Future-Proof**: As standards evolve, your code remains compliant
* **Reduced Tooling**: Less configuration, fewer build steps, and smaller bundles
* **Instant Development**: JSPM import maps can even be generated in the browser for instant sandbox workflows, a technique used by Framer, one of the project sponsors.

## Import Map Package Management

One of the major changes in JSPM 4.0 is import maps are now treated as package management artifacts more like lock files than manifests for hand-editing.

All package management operations output by default to the new `importmap.js` import map injection script file. This is effectively a workaround for the lack of external import map support for an `importmap.json` file in browsers. This injection script approach only recently gained wide browser support thanks to the new multiple import maps feature.

We use the following new approach:

```html
<script src="importmap.js"></script>
<script type="module">import 'app'</script>
```

Where the `importmap.js` injection script itself then directly inlines the new import map into the browser:

_importmap.js_
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

**It was surprisingly hard to figure out these import map ergonomics for the project but this is a major simplification that forms the new convention for the project going forward.**

Of course we still support `--out`, `--map` and `--resolution` flags (amongst [others](/docs/cli/interfaces/GenerateFlags)) for custom map inputs and outputs including JSON and HTML outputs as previously. `jspm link` is also still supported for the more complex map manipulation workflows. But the important point here is that if we get past treating maps as a user-based manifest and let JSPM act as the linker that figures it out based on constraints, we get some really great ergonomics out of import maps development.

## Hot Reloading Server

The JSPM 4.0 server (`jspm serve`) provides a development environment with instant hot module reloading built off the same conventions as install:

* **Zero Configuration**: Start serving your application with a single command.
* **Fast Refresh**: Changes to your code are reflected instantly in the browser.
* **TypeScript Support**: Write TypeScript without a separate build step.
* **Import Map Awareness**: Handles import map updates without refreshes.

The hot reloading system works by injecting a Server Side Events connection into the import map injection script itself. When files change, the server notifies the client and ES Module Shims handles the reloading of only the affected modules, preserving application state supporting the `import.meta.hot` API.

> The hot reloading server is made possible by [ES Module Shims](https://github.com/guybedford/es-module-shims), which is used in JSPM to polyfill import map features in older browsers like multiple import maps support, [recently adding support for hot reloading](https://guybedford.com/hot-reloading-es-module-shims-2.5).

## Building for Production

The semantics of `jspm build` follow from the same standards-based runtime semantics.

What makes this possible is clearly defining the application entry points, which we enforce from the start with `jspm install`, so that the package optimization is fully well defined without having to set the build entry points.

This is very much the same thing as what the JSPM.IO CDN already does today for npm packages, but now available locally.

## Future Directions

The ability to seamlessly run an online sandbox without a build step or proprietary infrastructure remains a primary goal of the project, and we are seeing this use case continue to grow as more sandboxes choose to build on top of JSPM, especially with the rapid growth of AI sandboxes.

Equally important are local-first workflows with minimal tooling.

These two approaches - online sandboxes and local-first workflows - have always been the two main aspects of JSPM. The first version of JSPM prioritized local workflows before demonstrating remote code loading capabilities, while in recent years the JSPM.IO CDN-first models have taken the front seat here.

Getting back to enabling completely CDN-free local workflows remains a major goal for the project and on the roadmap.

While provenance is crucial, equally important is avoiding vendor lock-in through standards. This standards-first philosophy is what we consider most critical to get right, and it's what this 4.0 release primarily represents.

JSPM 4.0 lays the groundwork for addressing these security concerns, and the project security focus will remain on these three problems: provider interchangeability via standards, CDN verification with integrity, and local provenance.

## Next Steps

JSPM 4.0 represents a significant step toward bringing back standards-first local import map workflows and we continue to believe that unifying package management with import maps creates a natural workflow for web development both for online sandboxes and local development use cases.

Please try out the new release and let us know your feedback!

* [Getting Started](/getting-started)
* [CLI Docs](/docs/cli)
* [Online Import Map Generator](https://generator.jspm.io)
