+++
title = "Getting Started"
description = "JSPM Getting Started"
next-section = "faq"
+++

# Getting Started

This guide runs through the steps of setting up the JSPM CLI and using it in some standard import maps workflows from development to production.

If you just want to get a quick feel for import maps without using the CLI, [see the online generator guide](/integrations#online-generator).

## Installation

Ensure you have [Node.js](https://nodejs.org/en) installed.

From the command-line, the JSPM CLI can then be installed using npm:

```
npm install -g jspm
```

## Initialize a new Project

To create a new JSPM project run:

```
jspm init my-project
```

This will guide you through a series of questions to set up your project:

```
Creating package.json in my-project

Package Name: (my-project) 
Version: (dev)
Description: 
Enable TypeScript with type stripping? (y/n)
Exports Entry Point: (src/index.ts)
Create a .gitignore file with JavaScript defaults? (y/n)
Create an index.html example app file? (y/n)
Create an AI prompt file? (y/n)
Which AI prompt file would you like to create?
```

When the initialization completes, you'll have a new project with several files:

```
✓  my-project/tsconfig.json created
✓  my-project/.gitignore created
✓  my-project/index.html created
✓  my-project/src/index.ts created   
✓  my-project/src/landing.js created 
✓  my-project/src/landing.css created
✓  my-project/CLAUDE.md created      
✓  my-project/package.json created

Ok: Initialization complete.
Info: Next, run cd my-project and jspm serve to start a local server.
```

## Starting the Development Server

JSPM provides a development server that handles auto-installation, hot reloading, and TypeScript type stripping.

To start the development server, run:

```
cd my-project
jspm serve
```

This will launch the local server on `http://localhost:5776`. You can press `o` to open the application in your browser, or navigate to the URL manually.

The development server watches for changes to your files and automatically refreshes the browser on changes. Applications can respond to reloads by implementing the `import.meta.hot` API supported by ES Module Shims.

Try changing the source of `src/landing.js` or `src/landing.css` to see live refreshes of both JS and CSS.

## How it Works

The following `package.json` was created by the initialization:

_package.json_
```json
{
  "name": "my-project",
  "version": "dev",
  "description": "",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

_importmap.js_
```js
(map => {
  const mapUrl = document.currentScript.src;
  const resolve = imports => Object.fromEntries(Object.entries(imports ).map(([k, v]) => [k, new URL(v, mapUrl).href]));
  document.head.appendChild(Object.assign(document.createElement("script"), {
    type: "importmap",
    innerHTML: JSON.stringify({
      imports: resolve(map.imports),
      scopes: Object.fromEntries(Object.entries(map.scopes).map(([k, v]) => [new URL(k, mapUrl).href, resolve(v)]))
    })
  }));
})
({
  "imports": {
    "my-project": "./src/index.ts"
  },
  "scopes": {
    "./": {
      "canvas-confetti": "https://ga.jspm.io/npm:canvas-confetti@1.9.3/dist/confetti.module.mjs"
    }
  }
});
```

The generated `index.html` contains the following:

_index.html_
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>my-project</title>
  <script src="importmap.js"></script>
  <script async crossorigin="anonymous" src="https://ga.jspm.io/npm:es-module-shims@2.5.1/dist/es-module-shims.js"></script>     
  <script type="module">import 'my-project';</script>
</head>
<body></body>
</html>
```

When the server is started, or when running `jspm install`, the `importmap.js` file is initialized:

When loading the HTML page in the browser:

1. The import map injection script is being loaded, which injects a `<script type="importmap"></script>` with the generated import map directly into the head of the page.
2. The ES Module Shims polyfill is being loaded which polyfills support for import maps and multiple import maps in older browsers, as well as supporting hot reloadinng.
3. Finally we import the application main entry point with `import 'my-project'`.

The import map will resolve the entry point source, and the browser itself will load the TypeScript file from `src/index.ts`.
The JSPM server will strip the types but leave source locations in tact so source maps are not even necessary for debugging and for example VSCode attachment can easily work for debugging as well back to original sources.

The `src/index.ts` in this example then loads a separate example page `landing.js` which in turn loads its own stylesheet using a natively-supported CSS import:

```js
import style from './landing.css' with { type: 'css' };

if (!document.adoptedStyleSheets.includes(style))
  document.adoptedStyleSheets.push(style);
```

Any changes made to the stylesheet get written into the same stylesheet that is imported here instantly.

> While ES Module Shims is recommended for browser compatibility and hot reloading, it is not strictly required in modern versions of Chrome - the application will still work fine natively if it is removed.

The rest is just static file serving, apart from optional TypeScript type stripping on the server, there is no other magic at all here, just standard JS ecosystem conventions.

## Managing Entry Points

The top-level `"imports"` in the import map are the main entry points. The `package.json` `"name"` is important here as it names these entry points - just as we needed to do `import 'my-project'` in the example.

`jspm install` uses scopes for all dependencies that are not the main entry points so that all imports should either be the package.json package name, or be a subpath of it.

To define new entry points, add them to the exports field of the package:

```json
{
  "name": "my-project",
  "version": "dev",
  "description": "",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./page2": "./src/page2.js"
  }
}
```

With the new entry point defined, another HTML page can contain `import 'my-project/page2'`.

Either run `jspm install` or `jspm serve` and the `importmap.js` file will be updated with this new mapping in the import map.

The `"exports"` field is a Node.js specification, the same one used for library entry points. It supports other useful features like conditional loading and pattern mappings, all of which are supported by JSPM. It is recommended to read the [Node.js documentation](https://nodejs.org/docs/latest/api/packages.html#package-entry-points) for further reference on this.

## Adding Dependencies

Keeping the development server, you can add new dependencies to your code and JSPM will refresh the import map automatically.

For example, edit `src/index.ts` (or `src/index.js` if you didn't enable TypeScript) to import and use Lit:

_src/index.ts_
```javascript
import * as lit from 'lit';

class MyElement extends lit.LitElement {
  static properties = {
    message: { type: String }
  };
  constructor() {
    super();
    this.message = 'Hello from JSPM and Lit!';
  }
  render() {
    return lit.html`<div>${this.message}</div>`;
  }
}


customElements.define('my-element', MyElement);
document.body.innerHTML = '<my-element></my-element>';
```

This will scan the application entry points, detect the `lit` import, and update your `importmap.js` file with its resolved dependency graph:

_importmap.js_
```json
({ /* ...injection script... */ })
({
  "imports": {
    "my-project": "./src/index.ts"
  },
  "scopes": {
    "./": {
      "lit": "https://ga.jspm.io/npm:lit@3.3.0/index.js"
    },
    "https://ga.jspm.io/npm:lit-element@4.2.0/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/development/reactive-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@3.3.0/development/lit-html.js"
    },
    "https://ga.jspm.io/npm:lit@3.3.0/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/development/reactive-element.js",
      "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@4.2.0/development/lit-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@3.3.0/development/lit-html.js",
      "lit-html/is-server.js": "https://ga.jspm.io/npm:lit-html@3.3.0/development/is-server.js"
    }
  }
});
```

JSPM's `importmap.js` acts like a lockfile in that once packages have been resolved to specific versions it will retain them at that version.

It is still advisable to also add package version constraints to the package.json file as well to ensure proper constraints, and support for `jspm update`.

## Using Specific Subpaths

Sometimes you may want to import a specific subpath of a package rather than the main entry point. For example, to use just the `html` feature of Lit:

`jspm ls` can be used to inspect what versions and entry points of packages are available:

```
jspm ls lit -f html
```

This will show you available subpaths containing "html":

```
Package:        lit@3.3.0
Description:    A library for building fast, lightweight web components
License:        BSD-3-Clause
Homepage:       https://lit.dev/
Repository:     https://github.com/lit/lit

Package Exports
./directives/unsafe-html.js → {
  "types": "./development/directives/unsafe-html.d.ts",
  "default": "./directives/unsafe-html.js"
}
./html.js → {
  "types": "./development/html.d.ts",
  "default": "./html.js"
}
./static-html.js → {
  "types": "./development/static-html.d.ts",
  "default": "./static-html.js"
}
```

Now update your code to import just this subpath:

_src/index.ts_
```javascript
import { html, render } from 'lit/html.js';

const template = html`<div>Hello from Lit HTML!</div>`;
render(template, document.body);
```

Run `jspm install` again to update your import map:

```
jspm install
```

## Using Conditional Environments

JSPM supports conditional environments for different build modes, such as development and production.

To switch the installed import map into production mappings we can enable the production condition with the `--conditions` flag:

```
jspm install -C production
```

This updates the `importmap.js` file with production URLs:

_importmap.js_
```json
({ /* ...injection script... */ })
({
  "imports": {
    "my-project": "./src/index.ts"
  },
  "scopes": {
    "./": {
      "lit": "https://ga.jspm.io/npm:lit@3.3.0/index.js"
    },
    "https://ga.jspm.io/npm:lit-element@4.2.0/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/reactive-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@3.3.0/lit-html.js"
    },
    "https://ga.jspm.io/npm:lit@3.3.0/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/reactive-element.js",
      "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@4.2.0/lit-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@3.3.0/lit-html.js",
      "lit-html/is-server.js": "https://ga.jspm.io/npm:lit-html@3.3.0/is-server.js"
    }
  }
});
```

Notice how the _development_ prefix is no longer present in the module paths. This allows packages to provide different implementations for development and production, and is a feature of [Node.js conditional exports](https://nodejs.org/dist/latest-v19.x/docs/api/packages.html#conditional-exports).

The default conditional environment for JSPM is `["browser", "development", "module"]`. The `-C production` flag is always required to ensure a production map.

## Import Map Integrity

For security, it is recommended to generate import maps with the [`"integrity"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap#integrity_metadata_map) field populated.

This field allows populating the Subresource Integrity for all modules both as part of the static module graph and also part of the dynamic module graph of the application (that may or may not be loaded at runtime).

We can achieve this by adding the `--integrity` flag to any install operation.

Instead of outputting into the same `importmap.js`, let's make this a separate `importmap.production.js` artifact by using the `-o` flag as well:

```
jspm install -C production --integrity -o importmap.production.js
```

This will create a new `importmap.production.js` with integrity hashes:

_importmap.production.js_
```json
({ /* ...injection script... */ })
({
  "imports": {
    "my-project": "./src/index.ts"
  },
  "scopes": {
    "./": {
      "canvas-confetti": "https://ga.jspm.io/npm:canvas-confetti@1.9.3/dist/confetti.module.mjs",
      "lit": "https://ga.jspm.io/npm:lit@3.3.0/index.js"
    },
    "https://ga.jspm.io/npm:lit-element@4.2.0/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/reactive-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@3.3.0/lit-html.js"
    },
    "https://ga.jspm.io/npm:lit@3.3.0/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/reactive-element.js",
      "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@4.2.0/lit-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@3.3.0/lit-html.js",
      "lit-html/is-server.js": "https://ga.jspm.io/npm:lit-html@3.3.0/is-server.js"
    }
  },
  "integrity": {
    "./src/index.ts": "sha384-xndJMHxpbrZzEpXDixygnadcmgKosRRSHO0iYKB/e1FXzGQr1ui7HJTSec9AM48k",
    "https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/css-tag.js": "sha384-yawoKnICWh5SyKPJlj47kOQj7ybzJ9CgSSJ2Auq37QyaMpqAqBy+HCOtHf6QSWKl",
    "https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/reactive-element.js": "sha384-+PmQcPI0ujsCr7U/4NZXVH/i2/LRYjnJYfGjo4fXvYxmwMVycRQZ+Wh4TAQ/1o9s",
    "https://ga.jspm.io/npm:canvas-confetti@1.9.3/dist/confetti.module.mjs": "sha384-tTDLnEmzqaB2FD/eQ6oeuk47x87LcMyZ4vyGWdkRlUjBbYCsh0PeYHB83tb5lkcH",
    "https://ga.jspm.io/npm:lit-element@4.2.0/lit-element.js": "sha384-xfzuCGvBA/QtAtuRtqiLcIsxDpQiQj+MzJVRhA0kw913TYcYzIB31PY9OIypK7gl",
    "https://ga.jspm.io/npm:lit-html@3.3.0/is-server.js": "sha384-c2UPp3lPxy1SKxJFIPcaK7PaWWWohEEwAaeBsoYeIF7ULocdSenWqg/7Iln4Dkw5",
    "https://ga.jspm.io/npm:lit-html@3.3.0/lit-html.js": "sha384-kPZntmv98MkUK0U+5niOLNQAQAK3WE0mqaX/br00elXsAxlcHvv5IQsZHFdHRAWH",
    "https://ga.jspm.io/npm:lit@3.3.0/index.js": "sha384-IZzW+Sfdx55gIfvWXINdnp5aNwUifd4IB0ROrRyipc+QWqXXpJhcbmT2+7tx9CCN"       
  }
})
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

If everything resolves correctly, the result is an `importmap.js` referencing the local `node_modules` folder:

_importmap.js_
```json
({ /* ...injection script... */ })
({
  "imports": {
    "my-project": "./src/index.ts"
  },
  "scopes": {
    "./": {
      "lit": "./node_modules/lit/index.js"
    },
    "./node_modules/lit-element/": {
      "@lit/reactive-element": "./node_modules/@lit/reactive-element/development/reactive-element.js",
      "lit-html": "./node_modules/lit-html/development/lit-html.js"
    },
    "./node_modules/lit/": {
      "@lit/reactive-element": "./node_modules/@lit/reactive-element/development/reactive-element.js",
      "lit-element/lit-element.js": "./node_modules/lit-element/development/lit-element.js",
      "lit-html": "./node_modules/lit-html/development/lit-html.js",
      "lit-html/is-server.js": "./node_modules/lit-html/development/is-server.js"
    }
  }
})
```

Alternatively, Lit can even be loaded from another CDN like UNPKG via `jspm install -p unpkg`.

By default JSPM supports `jspm.io`, `nodemodules`, `esm.sh`, `denoland`, `unpkg`, `skypack` and `jsdelivr` package providers, and custom providers can be configured programatically in the JSPM Generator core generation library as well.

> In general it is recommended to stick with the `jspm.io` provider for the best compatibility, but in time the native user experience of other providers should improve considerably.

### Building

Since the conventions and entry points are fully understood by JSPM's execution model, it can perform a build _of the entire package_ without any configuration further being necessary:

```
jspm build
```

This will run RollupJS against the entry points producing an optimized copy of the package inside of the `dist` folder. Files can be managed with the `"ignore"` and `"files"` fields in the package.json to include or exclude from this copying.

To create an import map for the built package we then need to install the optimized package.

Instead of outputting an import map directly let's output an optimized HTML file with the import map and preload tags injected:

```
jspm install --dir dist -C production --integrity --preload -o app.html
```

Will then generate an HTML page:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <script async src="https://ga.jspm.io/npm:es-module-shims@2.5.1/dist/es-module-shims.js" crossorigin="anonymous" integrity="sha384-Nce024cgIpt9LvkSDb7frhgilsi92irFYd1JDLfjX5R3Ozrad+5TTxeszg5f+WtQ"></script>
    <script type="importmap">
    {
      "imports": {
        "my-project": "./dist/src/index.js"
      },
      "scopes": {
        "./dist/": {
          "lit": "https://ga.jspm.io/npm:lit@3.3.0/index.js"
        },
        "https://ga.jspm.io/npm:lit-element@4.2.0/": {
          "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/reactive-element.js",
          "lit-html": "https://ga.jspm.io/npm:lit-html@3.3.0/lit-html.js"
        },
        "https://ga.jspm.io/npm:lit@3.3.0/": {
          "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/reactive-element.js",
          "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@4.2.0/lit-element.js",
          "lit-html": "https://ga.jspm.io/npm:lit-html@3.3.0/lit-html.js",
          "lit-html/is-server.js": "https://ga.jspm.io/npm:lit-html@3.3.0/is-server.js"
        }
      },
      "integrity": {
        "./dist/src/index.js": "sha384-wx/myYGGnUfXlCxJwYrPM42cKPKgodMDRmvrfSkApslhw67eQSUNgoYmLM7Edbsy",
        "https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/css-tag.js": "sha384-yawoKnICWh5SyKPJlj47kOQj7ybzJ9CgSSJ2Auq37QyaMpqAqBy+HCOtHf6QSWKl",
        "https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/reactive-element.js": "sha384-+PmQcPI0ujsCr7U/4NZXVH/i2/LRYjnJYfGjo4fXvYxmwMVycRQZ+Wh4TAQ/1o9s",
        "https://ga.jspm.io/npm:lit-element@4.2.0/lit-element.js": "sha384-xfzuCGvBA/QtAtuRtqiLcIsxDpQiQj+MzJVRhA0kw913TYcYzIB31PY9OIypK7gl",
        "https://ga.jspm.io/npm:lit-html@3.3.0/is-server.js": "sha384-c2UPp3lPxy1SKxJFIPcaK7PaWWWohEEwAaeBsoYeIF7ULocdSenWqg/7Iln4Dkw5",
        "https://ga.jspm.io/npm:lit-html@3.3.0/lit-html.js": "sha384-kPZntmv98MkUK0U+5niOLNQAQAK3WE0mqaX/br00elXsAxlcHvv5IQsZHFdHRAWH",
        "https://ga.jspm.io/npm:lit@3.3.0/index.js": "sha384-IZzW+Sfdx55gIfvWXINdnp5aNwUifd4IB0ROrRyipc+QWqXXpJhcbmT2+7tx9CCN"   
      }
    }
    </script>
    <link rel="modulepreload" href="./dist/src/index.js" integrity="sha384-wx/myYGGnUfXlCxJwYrPM42cKPKgodMDRmvrfSkApslhw67eQSUNgoYmLM7Edbsy" />
    <link rel="modulepreload" href="https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/css-tag.js" integrity="sha384-yawoKnICWh5SyKPJlj47kOQj7ybzJ9CgSSJ2Auq37QyaMpqAqBy+HCOtHf6QSWKl" />
    <link rel="modulepreload" href="https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/reactive-element.js" integrity="sha384-+PmQcPI0ujsCr7U/4NZXVH/i2/LRYjnJYfGjo4fXvYxmwMVycRQZ+Wh4TAQ/1o9s" />
    <link rel="modulepreload" href="https://ga.jspm.io/npm:lit-element@4.2.0/lit-element.js" integrity="sha384-xfzuCGvBA/QtAtuRtqiLcIsxDpQiQj+MzJVRhA0kw913TYcYzIB31PY9OIypK7gl" />
    <link rel="modulepreload" href="https://ga.jspm.io/npm:lit-html@3.3.0/is-server.js" integrity="sha384-c2UPp3lPxy1SKxJFIPcaK7PaWWWohEEwAaeBsoYeIF7ULocdSenWqg/7Iln4Dkw5" />
    <link rel="modulepreload" href="https://ga.jspm.io/npm:lit-html@3.3.0/lit-html.js" integrity="sha384-kPZntmv98MkUK0U+5niOLNQAQAK3WE0mqaX/br00elXsAxlcHvv5IQsZHFdHRAWH" />
    <link rel="modulepreload" href="https://ga.jspm.io/npm:lit@3.3.0/index.js" integrity="sha384-IZzW+Sfdx55gIfvWXINdnp5aNwUifd4IB0ROrRyipc+QWqXXpJhcbmT2+7tx9CCN" />
  </head>
  <body>
  </body>
</html>
```

### Dependency Inlining

If instead of having a production import map we wanted to have a single bundle that inlined the Lit dependency, this cam be achieved with the following externals convention in JSPM.

Move the `"lit"` dependency in the `"dependencies"` of the package.json to instead in the `"devDependencies"`:

_package.json_
```json
{
  "name": "my-project",
  "version": "dev",
  "description": "",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "devDependencies": {
    "es-module-shims": "^2.5.1",
    "lit": "^3.3.0"
  }
}

```

Then running `jspm build` again, the output package will be optimized with no dependencies, and no import map is necessary to execute the application.

### CSS and JSON Builds

Imports to CSS files and JSON files through native stylesheet imports:

```js
import style from './style.css' with { type: 'css' };

if (!document.adoptedStyleSheets.includes(style))
  document.adoptedStyleSheets.push(style);
```

and JSON imports:

```js
import json from './data.json' with { type: 'json' };
```

are fully supported in build workflows, with CSS assets being rebased in the build process.
