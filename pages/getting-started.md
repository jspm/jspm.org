+++
title = "Getting Started"
description = "JSPM Getting Started"
next-section = "faq"
+++

# Getting Started

This guide runs through the steps of setting up the JSPM CLI and using it in some standard import maps workflows from development to production.

If you just want to get a quick feel for import maps, [skip to the online generator guide](#online-generator).

For Deno import map workflows, see the [Deno workflows](#deno-workflows) section.

## Installation

Ensure you have [Node.js](https://nodejs.org/en) installed.

From the command-line, the JSPM CLI can then be installed using npm:

```
npm install -g jspm
```

## It's Just Linking

With JSPM installed, let's create an import map.

All browsers require import maps to be inlined into the HTML file that is being provided to the browser.

Create a `lit.html` file:

```html
<!doctype html>
<script type="module">
  import * as lit from 'lit';
  console.log(lit);
</script>
```

Now we can use JSPM to _link_ this HTML file and create the import map necessary for it to work correctly:

```
jspm link lit.html -o lit.html
```

The above tells JSPM to trace the modules inside of `lit.html` and generate the import map for them, then injecting the import map output back into `lit.html`.

This will update `lit.html` to contain the following:

```html
<!doctype html>
<script async src="https://ga.jspm.io/npm:es-module-shims@1.10.0/dist/es-module-shims.js" crossorigin="anonymous" integrity="sha384-ie1x72Xck445i0j4SlNJ5W5iGeL3Dpa0zD48MZopgWsjNB/lt60SuG1iduZGNnJn"></script>
<script type="importmap">
{
  "imports": {
    "lit": "https://ga.jspm.io/npm:lit@3.1.4/index.js"
  },
  "scopes": {
    "https://ga.jspm.io/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.0.4/development/reactive-element.js",
      "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@4.0.6/development/lit-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@3.1.4/development/lit-html.js",
      "lit-html/is-server.js": "https://ga.jspm.io/npm:lit-html@3.1.4/development/is-server.js"
    }
  }
}
</script>
<script type="module">
  import * as lit from 'lit';
  console.log(lit);
</script>
```

JSPM has traced out all the dependencies necessary for an import of `import 'lit'` to work correctly, and provided the versioned resolutions of those dependencies against the production-optimized [jspm.io module CDN](/cdn/jspm-io). It has also included [ES Module Shims](https://github.com/guybedford/es-module-shims) to polyfill import maps in browsers without support for import maps.

Run a local server to view the application (disabling local caching to enable development refreshing):

```
npx http-server -c-1
```

> For server-side HTML generation, the import map should be created ahead of time as JSON, which is inlined by the server. Note that JSPM HTML injection uses a very lenient HTML parser that should support templating languages just fine. JSON import map output for JSPM is the default when not specifying a different output via the `-o` option.

## Linking Local Application Code

Instead of using inline modules, we can link local modules directly, changing the inline `lit` import to a local application path instead:

_app.html_
```html
<!doctype html>
<script type="module">import './src/app.js'</script>
```

Where `src/app.js` contains local application:

_src/app.js_
```js
import * as lit from 'lit';

console.log(lit);
```

Now we can link the application code directly instead to inject into `app.html`:

```
jspm link src/app.js -o app.html
```

The generated `app.html` now includes both our local code mapping as well as the lit mapping:

> When using TypeScript or JSX workflows, it is advisable to have a compilation step that compiles these files from `src/[file].ts` into corresponding direct `lib/[file].js` output file, individually, eg via the normal `tsc` invocation in TypeScript or when using a tool like `swc` for JSX. [Chomp](https://chompbuild.com) is another task runner that is based around this [per-file compilation pattern](https://github.com/guybedford/chomp#example-typescript-with-swc). See the [production workflow](#production-workflow) at the end of this guide for handling local code optimization.

## Package Management with Import Maps

So how does package management fit in with this? Well, the import maps that we have been generating all involve versioned solutions for dependency graphs that we are linking in. The import map itself behaves like a lock file.

Instead of just linking and generating the lock file each time, we can instead be a bit more deliberate about import map packagement with JSPM.

### Defining Dependency Ranges

Unless otherwise specified, JSPM uses the `package.json` for dependency ranges for both local and remote packages, just like Node.js (and other runtimes).

_package.json_
```json
{
  "type": "module",
  "dependencies": {
    "lit": "^3"
  }
}
```

Instead of linking from scratch every single time, we can perfom a top-level install operation for lit. In larger projects there are likely multiple pages with different dependencies, while we want the main versioning and package management to dedupe versions between all of those.

### Installing Packages

To install and lock package versions and resolutions ahead of time, use `jspm install`:

```
jspm install lit lit/html.js
```

This populates a local `importmap.json` file with the locked import map resolutions for both `lit` and `lit/html.js`:

_importmap.json_
```json
{
  "env": [
    "browser",
    "development",
    "module"
  ],
  "imports": {
    "lit": "https://ga.jspm.io/npm:lit@3.1.4/index.js",
    "lit/html.js": "https://ga.jspm.io/npm:lit@3.1.4/html.js"
  },
  "scopes": {
    "https://ga.jspm.io/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.0.4/development/reactive-element.js",
      "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@4.0.6/development/lit-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@3.1.4/development/lit-html.js",
      "lit-html/is-server.js": "https://ga.jspm.io/npm:lit-html@3.1.4/development/is-server.js"
    }
  }
}
```

### Defining Custom Mappings

Any edits we make to this local import map file are respected when performing the subsequent `link` operations.

In addition any URLs can be installed into the import map as well.

For example, say we want to load the local application as `import 'app'`, we can set add this map entry using an aliased install:

```
jspm install app=./src/app.js
```

_importmap.json_
```json
{
  "env": [
    "browser",
    "development",
    "module"
  ],
  "imports": {
    "app": "./src/app.js",
    "lit": "https://ga.jspm.io/npm:lit@3.1.4/index.js",
    "lit/html.js": "https://ga.jspm.io/npm:lit@3.1.4/html.js"
  },
  "scopes": {
    "https://ga.jspm.io/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.0.4/development/reactive-element.js",
      "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@4.0.6/development/lit-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@3.1.4/development/lit-html.js",
      "lit-html/is-server.js": "https://ga.jspm.io/npm:lit-html@3.1.4/development/is-server.js"
    }
  }
}
```

Just like npm can install local folders, local module URLs can be installed directly in JSPM, and they can also point to fully remote module URLs with transitive dependency installs applying in all cases.

Top-level `"imports"` entries are always maintained in the import map as the primary dependencies, while scopes are pruned depending on what is being used.

Now we can update the HTML file to load `app` directly instead of having to hard-code the path:

_app.html_
```html
<!doctype html>
<script type="module">import 'app'</script>
```

### Linking from importmap.json

By default `importmap.json` is always consulted as the source of truth for the initial mappings in all operations.

So linking `app` directly into `app.html`, it will now already have the correct resolution from there:

```
jspm link app -o app.html
```

The `importmap.json` mappings will be respected, but only those mappings actually needed by the linking operation will be injected.

This results in:

_app.html_
```html
<!doctype html>
<script async src="https://ga.jspm.io/npm:es-module-shims@1.10.0/dist/es-module-shims.js" crossorigin="anonymous"></script>
<script type="importmap">
{
  "imports": {
    "app": "./src/app.js"
  },
  "scopes": {
    "./": {
      "lit": "https://ga.jspm.io/npm:lit@3.1.4/index.js"
    },
    "https://ga.jspm.io/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.0.4/development/reactive-element.js",
      "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@4.0.6/development/lit-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@3.1.4/development/lit-html.js",
      "lit-html/is-server.js": "https://ga.jspm.io/npm:lit-html@3.1.4/development/is-server.js"
    }
  }
}
</script>
<script type="module">import 'app'</script>
```

> Notice that `lit/html.js` wasn't injected because `jspm link` only traces what is necessary to link the provided module list to the linking command.

## Conditional Environments

The `"env"` field in `importmap.json` includes conditional environment that we have installed against. The default in this case being the `"browser"`, `"module"` `"development"` environment.

To switch to using the production versions of the dependencies, we can perform an argumentless install to update the entire `importmap.json` file:

```
jspm install --env=production
```

The import map is converted into production resolutions:

_importmap.json_
```
{
  "env": [
    "browser",
    "module",
    "production"
  ],
  "imports": {
    "app": "./src/app.js",
    "lit": "https://ga.jspm.io/npm:lit@3.1.4/index.js",
    "lit/html.js": "https://ga.jspm.io/npm:lit@3.1.4/html.js"
  },
  "scopes": {
    "https://ga.jspm.io/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.0.4/reactive-element.js",
      "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@4.0.6/lit-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@3.1.4/lit-html.js",
      "lit-html/is-server.js": "https://ga.jspm.io/npm:lit-html@3.1.4/is-server.js"
    }
  }
}
```

Notice how the _development_ prefix is no longer present in the module paths. This allows packages to provide different implementations for development and production, and is a feature of [Node.js conditional exports](https://nodejs.org/dist/latest-v19.x/docs/api/packages.html#conditional-exports).

> The `"env"` field is not an import map standard, but is used internally by JSPM for the `importmap.json` file only, when working with JSON import maps in order to be able to consistently resolve them in the correct environment. Future versions may use a separate environment file.

## Import Map Integrity

For security, it is recommended to generate import maps with the [`"integrity"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap#integrity_metadata_map) field populated.

This field allows populating the Subresource Integrity for all modules both as part of the static module graph and also part of the dynamic module graph of the application (that may or may not be loaded at runtime).

We can achieve this by adding the `--integrity` flag to any install or link operation.

For example at link time injection into the HTML:

```
jspm link app -o app.html --integrity
```

Giving:

_app.html_
```html
<!doctype html>
<script async src="https://ga.jspm.io/npm:es-module-shims@1.10.0/dist/es-module-shims.js" crossorigin="anonymous" integrity="sha384-ie1x72Xck445i0j4SlNJ5W5iGeL3Dpa0zD48MZopgWsjNB/lt60SuG1iduZGNnJn"></script>
<script type="importmap">
{
  "imports": {
    "app": "./src/app.js"
  },
  "scopes": {
    "./": {
      "lit": "https://ga.jspm.io/npm:lit@3.1.4/index.js"
    },
    "https://ga.jspm.io/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.0.4/reactive-element.js",
      "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@4.0.6/lit-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@3.1.4/lit-html.js",
      "lit-html/is-server.js": "https://ga.jspm.io/npm:lit-html@3.1.4/is-server.js"
    }
  },
  "integrity": {
    "./src/app.js": "sha384-HVnIfD4r9M9RDNWQ97t76wrsWabmX4dXGLTYd9zKuuhcMIwEdXtZH8xXbie6YrtJ",
    "https://ga.jspm.io/npm:@lit/reactive-element@2.0.4/css-tag.js": "sha384-yawoKnICWh5SyKPJlj47kOQj7ybzJ9CgSSJ2Auq37QyaMpqAqBy+HCOtHf6QSWKl",
    "https://ga.jspm.io/npm:@lit/reactive-element@2.0.4/reactive-element.js": "sha384-hrSJOlBhLHm9bNnuvt+DKINVyUGKXumnclZjoynsvhjcBH69MUnc5vwNr7u6L1UM",
    "https://ga.jspm.io/npm:lit-element@4.0.6/lit-element.js": "sha384-Ch491m5L+ErRD9ie6LoKZflmDdk/x65NSh7Me3mbPxzZkb1YlTOL8Z7TFpZZseDY",
    "https://ga.jspm.io/npm:lit-html@3.1.4/is-server.js": "sha384-c2UPp3lPxy1SKxJFIPcaK7PaWWWohEEwAaeBsoYeIF7ULocdSenWqg/7Iln4Dkw5",
    "https://ga.jspm.io/npm:lit-html@3.1.4/lit-html.js": "sha384-jM1anKsXoI4092s8FRYctiy0ivkYAlyAkalNV+KenxDKp5wObhV79xo94Ge5rZAQ",
    "https://ga.jspm.io/npm:lit@3.1.4/index.js": "sha384-IZzW+Sfdx55gIfvWXINdnp5aNwUifd4IB0ROrRyipc+QWqXXpJhcbmT2+7tx9CCN"
  }
}
</script>
<script type="module">import 'app'</script>
```

## Changing Providers

The benefits of using an ESM-native CDN like `jspm.io` is that dependencies are fully production optimized, and older packages that only support CommonJS are automatically converted by the CDN into ES modules to support browser usage.

Lit is actually a package that is designed from the start as an ESM package and it is also optimized at publish time, so it's actually possible to create an import map directly against the original sources.

### The nodemodules Provider

To achieve this locally, install the dependencies into node_modules with npm, as well as the `es-module-shims` polyfill itself:

```
npm install lit es-module-shims
```

Now the `--provider` option will resolve all packages against the `nodemodules` provider with JSPM, just like the conditional environment change was handled previously:

```
jspm install --provider nodemodules
```

If everything resolves correctly, the result is an `importmap.json` referencing the local `node_modules` folder:

```json
{
  "env": [
    "browser",
    "module",
    "production"
  ],
  "imports": {
    "app": "./src/app.js",
    "lit": "./node_modules/lit/index.js"
  },
  "scopes": {
    "./node_modules/": {
      "@lit/reactive-element": "./node_modules/@lit/reactive-element/reactive-element.js",
      "lit-element/lit-element.js": "./node_modules/lit-element/lit-element.js",
      "lit-html": "./node_modules/lit-html/lit-html.js",
      "lit-html/is-server.js": "./node_modules/lit-html/is-server.js"
    }
  }
}
```

### Using Other CDN Providers

Alternatively, Lit can be loaded from another CDN like UNPKG:

```
jspm install --provider unpkg
```

Resulting in:

_importmap.json_
```json
{
  "env": [
    "browser",
    "module",
    "production"
  ],
  "imports": {
    "app": "./src/app.js",
    "lit": "https://unpkg.com/lit@3.1.4/index.js",
    "lit/html.js": "https://unpkg.com/lit@3.1.4/html.js"
  },
  "scopes": {
    "https://unpkg.com/": {
      "@lit/reactive-element": "https://unpkg.com/@lit/reactive-element@2.0.4/reactive-element.js",
      "lit-element/lit-element.js": "https://unpkg.com/lit-element@4.0.6/lit-element.js",
      "lit-html": "https://unpkg.com/lit-html@3.1.4/lit-html.js",
      "lit-html/is-server.js": "https://unpkg.com/lit-html@3.1.4/is-server.js"
    }
  }
}
```

Note all resolution features including version resolution and conditional exports still work against the UNPKG provider.

Switch back to the [jspm.io provider](/cdn/jspm-io) with:

```
jspm install --provider jspm.io
```

> By default JSPM supports `jspm.io`, `nodemodules`, `esm.sh`, `denoland`, `unpkg`, `skypack` and `jsdelivr` package providers, and custom providers can be configured programatically in the JSPM Generator core generation library as well.

## Production Workflow

The package management workflows above result in a very low-overhead development process. Local modules can import from other local modules all in the browser, and dependencies are cached for very fast refreshing. It makes for a very simple browser development workflow using just native ES modules.

For small applications it can be fine to just ship unminified / unbundled sources. But for larger applications it is always necessary to implement a build step for production.

We already switched from development to production dependencies changing the [conditional environment](#conditional-environments), so we only need to perform the bundle step.

### Bundling with esbuild

To build `src/app.js` for production with esbuild, first install esbuild:

```
npm install esbuild
```

Then run a build of the `src/app.js` module, while treating all bare specifier imports as externals:

```
./node_modules/.bin/esbuild src/app.js --bundle --format=esm --external:* --outfile=dist/app.js
```

* `--format=esm` tells esbuild to output an ES module file, so we are still using native browser modules
* `--external:*` ensures we externalize all bare specifiers

Update `importmap.json` to reference `dist/app.js` instead of `src/app.js` (either manually or via `jspm install app=./dist/app.js`):

_importmap.json_
```json
{
  "env": [
    "browser",
    "development",
    "module"
  ],
  "imports": {
    "app": "./dist/app.js",
    "lit": "https://ga.jspm.io/npm:lit@2.7.0/index.js",
    "lit/html.js": "https://ga.jspm.io/npm:lit@2.7.0/html.js"
  },
  "scopes": {
    "https://ga.jspm.io/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@1.6.1/development/reactive-element.js",
      "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@3.3.0/development/lit-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@2.7.0/development/lit-html.js",
      "lit-html/is-server.js": "https://ga.jspm.io/npm:lit-html@2.7.0/development/is-server.js"
    }
  }
}
```

### Preload Injection

Now, when performing the `app.html` import map HTML injection for production add the `--preload` flag to inject `modulepreload` tags for the application:

```
jspm link app -o app.html --integrity --preload
```

> Using `--integrity` is always recommended in production workflows.

This results in the HTML:

_app.html_
```
<!doctype html>
<script async src="https://unpkg.com/es-module-shims@1.10.0/dist/es-module-shims.js" crossorigin="anonymous" integrity="sha384-BTO8nLHukFlPxTSib9wgQyLgd2oYLxp24Goxje82QeHp7cwyUtgx4Z32PCEb3Q09"></script>
<script type="importmap">
{
  "imports": {
    "app": "./dist/app.js"
  },
  "scopes": {
    "./": {
      "lit": "https://unpkg.com/lit@3.1.4/index.js"
    },
    "https://unpkg.com/": {
      "@lit/reactive-element": "https://unpkg.com/@lit/reactive-element@2.0.4/reactive-element.js",
      "lit-element/lit-element.js": "https://unpkg.com/lit-element@4.0.6/lit-element.js",
      "lit-html": "https://unpkg.com/lit-html@3.1.4/lit-html.js",
      "lit-html/is-server.js": "https://unpkg.com/lit-html@3.1.4/is-server.js"
    }
  },
  "integrity": {
    "./dist/app.js": "sha384-HVnIfD4r9M9RDNWQ97t76wrsWabmX4dXGLTYd9zKuuhcMIwEdXtZH8xXbie6YrtJ",
    "https://unpkg.com/@lit/reactive-element@2.0.4/css-tag.js": "sha384-1JuWTNKIc0DkMosyCcN1AJitipoYtChQRQFPAy86mjgaY/WKLowYVIBvrtz/u5at",
    "https://unpkg.com/@lit/reactive-element@2.0.4/reactive-element.js": "sha384-pDU4ar+KtqcWu373vjAYQAIN0HF3S20cEBNBOijuiP/S8+u8zFW7uHbRfpfKk4sw",
    "https://unpkg.com/lit-element@4.0.6/lit-element.js": "sha384-fIBuTVjazP9bO4oLnv0v20Yz48dgX72dyoGOHvX+HRCpmspbeZiZmejeWEE7mteF",
    "https://unpkg.com/lit-html@3.1.4/is-server.js": "sha384-crhQkQLPOb3el2vcKz47A0M8Cd2FRDBqphYHICt24evksUD+0jHCMTmzA9APtE8l",
    "https://unpkg.com/lit-html@3.1.4/lit-html.js": "sha384-VJakUbb6MBy04vxifh8YNUi5CtV5/8eysq8XYkl0suBDdp8jiKERcEZUQNnKupsM",
    "https://unpkg.com/lit@3.1.4/index.js": "sha384-IZzW+Sfdx55gIfvWXINdnp5aNwUifd4IB0ROrRyipc+QWqXXpJhcbmT2+7tx9CCN"
  }
}
</script>
<link rel="modulepreload" href="./dist/app.js" />
<link rel="modulepreload" href="https://unpkg.com/@lit/reactive-element@2.0.4/css-tag.js" />
<link rel="modulepreload" href="https://unpkg.com/@lit/reactive-element@2.0.4/reactive-element.js" />
<link rel="modulepreload" href="https://unpkg.com/lit-element@4.0.6/lit-element.js" />
<link rel="modulepreload" href="https://unpkg.com/lit-html@3.1.4/is-server.js" />
<link rel="modulepreload" href="https://unpkg.com/lit-html@3.1.4/lit-html.js" />
<link rel="modulepreload" href="https://unpkg.com/lit@3.1.4/index.js" />
<script>import 'app'</script>
```

The full set of static preloads being included in the HTML means that there is no dependency waterfall roundtrip latency, and instead all static dependencies are immediately requested upfront by the browser. This completes the production workflow.

## Local Conditions

In the previous workflows it was necessary to manually maintain the `app` mapping, and update this mapping when moving from development to production.

It is actually also possible to automatically manage this mapping in JSPM using standard module resolution features in the `package.json` file, with the following configuration:

_package.json_
```
{
  "name": "app",
  "exports": {
    ".": {
      "development": "./src/app.js",
      "default": "./dist/app.js"
    }
  }
}
```

Running:

```
jspm install --env=development
```

will now update the `app` mapping in `importmap.json` from `dist/app.js` to `src/app.js`.

JSPM is able to automatically switch between production and development modes for both the local application and external package code.

> The above `package.json` `"name"` definition may look like a JSPM-specific workflow trick, but this is actually a native modules feature of Node.js module resolution, and is supported by most JS tooling, called [package self-reference resolution](https://nodejs.org/dist/latest-v19.x/docs/api/packages.html#self-referencing-a-package-using-its-name).

## Online Generator

The easiest way to try out JSPM is to generate an import map using the online generator at [https://generator.jspm.io](https://generator.jspm.io).

<div style="text-align: center;">
<a href="https://generator.jspm.io"><img style="width: 100%" src="/steps/online-0.png" /></a>
</div>

In the top-left corner enter an npm package name to add to the import map (`lit` in this example):

<div style="text-align: center;">
<img src="/steps/online-1.png" />
</div>

Press `Return` to add the package to the map. Then add any other dependency entries. For example to add the `./html.js` subpath export of lit, add `lit/html.js`:

<div style="text-align: center;">
<img src="/steps/online-2.png" />
</div>

Versions are supported in package names before the subpath and items can be removed or changed from the controls provided.

The final import map is shown on the right, and can be retrieved as an HTML page template or as direct JSON.

In [this example](https://generator.jspm.io/#U2VhYGBiDs0rySzJSU1hyMkscTDWM9QzQbD0M0pyc/SyigHdBe16KgA) we get:

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Untitled</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <!--
    JSPM Generator Import Map
    Edit URL: https://generator.jspm.io/#U2VhYGBiDs0rySzJSU1hyMkscTDWM9QzQbD0M0pyc/SyigHdBe16KgA
  -->
   <script type="importmap">
  {
    "imports": {
      "lit": "https://ga.jspm.io/npm:lit@3.1.4/index.js",
      "lit/html.js": "https://ga.jspm.io/npm:lit@3.1.4/html.js"
    },
    "scopes": {
      "https://ga.jspm.io/": {
        "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.0.4/development/reactive-element.js",
        "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@4.0.6/development/lit-element.js",
        "lit-html": "https://ga.jspm.io/npm:lit-html@3.1.4/development/lit-html.js",
        "lit-html/is-server.js": "https://ga.jspm.io/npm:lit-html@3.1.4/development/is-server.js"
      }
    }
  }
  </script>
  
  <!-- ES Module Shims import maps polyfills -->
  <script async src="https://ga.jspm.io/npm:es-module-shims@1.10.0/dist/es-module-shims.js" crossorigin="anonymous"></script>
  
  <script type="module">
    import * as lit from "lit";
    import * as litHtml from "lit/html.js";
  
    // Write main module code here, or as a separate file with a "src" attribute on the module script.
    console.log(lit, litHtml);
  </script>
</body>
</html>
```

Saving the HTML template locally and serving over a local server provides a full native modules workflow for working with remote npm packages without needing any separate build steps.

The included [ES Module Shims polyfill](https://github.com/guybedford/es-module-shims) ensures the import maps still work in browsers without import maps support.

The online generator also provides full support for integrity, preloading and custom providers.
