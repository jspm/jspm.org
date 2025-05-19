+++
title = "Getting Started"
description = "JSPM Getting Started"
next-section = "faq"
+++

# Getting Started

This guide runs through the steps of setting up the JSPM CLI and using it in standard import maps workflows from development to production.

If you just want to get a quick feel for import maps without using the CLI, [see the online generator guide](/docs/integrations#online-generator).

## Table of Contents

- [Installation](#installation)
- [Initialize a new Project](#initialize-a-new-project)
- [Starting the Development Server](#starting-the-development-server)
- [Understanding the Project Structure](#understanding-the-project-structure)
- [What are Import Maps?](#what-are-import-maps)
- [How Import Maps Work in the Project](#how-import-maps-work-in-the-project)
- [Managing Entry Points](#managing-entry-points)
- [Adding Dependencies](#adding-dependencies)
- [Using Specific Subpaths](#using-specific-subpaths)
- [Using Conditional Environments](#using-conditional-environments)
- [Import Map Integrity for Security](#import-map-integrity-for-security)
- [Working with Different Package Providers](#working-with-different-package-providers)
- [Building for Production](#building-for-production)
- [Browser Compatibility and Troubleshooting](#browser-compatibility-and-troubleshooting)
- [Deployment](#deployment)
- [Next Steps](#next-steps)

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

This will guide you through a series of questions to set up the project:

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

Your project structure will look like this:

```
my-project/
├── .gitignore           # Git ignore file
├── CLAUDE.md            # AI prompt file (optional)
├── index.html           # Main HTML entry point
├── importmap.js         # Generated when you run jspm serve or install
├── package.json         # Project configuration
├── tsconfig.json        # TypeScript configuration (when enabled)
└── src/
    ├── index.ts         # Main application entry point
    ├── landing.js       # Example landing page implementation
    └── landing.css      # Landing page stylesheet
```

## Starting the Development Server

JSPM provides a development server that handles auto-installation, hot reloading, and TypeScript type stripping.

To start the development server, run:

```
cd my-project
jspm serve
```

This will launch the local server on `http://localhost:5776` demonstrating the import map running natively in the browser. You can press `o` to open the application in the browser, or navigate to the URL manually.

The development server watches for changes to files and automatically refreshes when they change. Modules will be reloaded automatically and can also respond to reloads by implementing the `import.meta.hot` API supported by ES Module Shims to avoid cascading reloads to their parents.

## Understanding the Project Structure

Before modifying files, let's understand the structure of the project:

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

When starting the project the import map injection script is generated:

_importmap.js_

```js
((map) => {
  const mapUrl = document.currentScript.src;
  const resolve = (imports) =>
    Object.fromEntries(
      Object.entries(imports).map(([k, v]) => [k, new URL(v, mapUrl).href])
    );
  document.head.appendChild(
    Object.assign(document.createElement("script"), {
      type: "importmap",
      innerHTML: JSON.stringify({
        imports: resolve(map.imports),
        scopes: Object.fromEntries(
          Object.entries(map.scopes).map(([k, v]) => [
            new URL(k, mapUrl).href,
            resolve(v),
          ])
        ),
      }),
    })
  );
})({
  imports: {
    "my-project": "./src/index.ts",
  },
  scopes: {
    "./": {
      "canvas-confetti":
        "https://ga.jspm.io/npm:canvas-confetti@1.9.3/dist/confetti.module.mjs",
    },
  },
});
```

The generated `index.html` contains:

_index.html_

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>my-project</title>
    <script src="importmap.js"></script>
    <script
      async
      crossorigin="anonymous"
      src="https://ga.jspm.io/npm:es-module-shims@2.5.1/dist/es-module-shims.js"
    ></script>
    <script type="module">
      import "my-project";
    </script>
  </head>
  <body></body>
</html>
```

## What are Import Maps?

Import maps are a web standard that allow you to control how the browser resolves JavaScript module imports. They provide a way to map import specifiers (like `import * from 'lit'`) to actual URLs where those modules can be found.

With import maps, you can:

- Use bare module specifiers in browsers without bundling
- Load dependencies from CDNs or local files
- Control versioning of dependencies
- Set up advanced module resolution patterns

JSPM makes working with import maps simpler by automating their creation and management.

## How Import Maps Work in the Project

When the server is started, or when running `jspm install`, the `importmap.js` file is initialized. When loading the HTML page in the browser:

1. The import map injection script loads first, which injects a `<script type="importmap">{ ... }</script>` element with the generated import map directly into the page's head.
2. The ES Module Shims polyfill loads next, providing support for multiple import maps in browsers that don't natively support these features as well as for the hot reloading feature.
3. Finally, the application's main entry point is imported with `import 'my-project'`.

The import map resolves this bare import to the source file at `./src/index.ts`. The JSPM server automatically strips TypeScript types while preserving source locations, making debugging straightforward even without separate source maps.

The `src/index.ts` in this example loads a separate example page `landing.js`, which in turn loads its own stylesheet using a natively-supported CSS import:

```js
import style from './landing.css' with { type: 'css' };

if (!document.adoptedStyleSheets.includes(style))
  document.adoptedStyleSheets.push(style);
```

Try changing the source of `src/landing.js` or `src/landing.css` to see live refreshes of both JS and CSS in action.

> While ES Module Shims is recommended for browser compatibility and hot reloading, it is not strictly required in modern versions of Chrome - the application will still work natively if it is removed.

It is also possible to run a completely static server with just `jspm serve --static` turning off hot reloading and entirely running on the native browser loader.

## Managing Entry Points

The top-level `"imports"` section in the import map defines the main entry points. The `package.json` `"name"` field is important here as it names these entry points - that's why we use `import 'my-project'` in the example.

JSPM uses scopes for all dependencies that are not main entry points, ensuring that all imports should either be the package.json package name or a subpath of it.

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

Either run `jspm install` or restart `jspm serve` and the `importmap.js` file will be updated with this new mapping.

The `"exports"` field follows the Node.js specification used for library entry points. It supports other useful features like conditional loading and pattern mappings, all of which are supported by JSPM. Read the [Node.js documentation](https://nodejs.org/docs/latest/api/packages.html#package-entry-points) for more details.

## Adding Dependencies

While the development server is running, you can add new dependencies to the code and JSPM will refresh the import map automatically.

For example, edit `src/index.ts` (or `src/index.js` if you didn't enable TypeScript) to import and use Lit, a popular library for creating web components:

_src/index.ts_

```javascript
import * as lit from "lit";

class MyElement extends lit.LitElement {
  static properties = {
    message: { type: String },
  };
  constructor() {
    super();
    this.message = "Hello from JSPM and Lit!";
  }
  render() {
    return lit.html`<div>${this.message}</div>`;
  }
}

customElements.define("my-element", MyElement);
document.body.innerHTML = "<my-element></my-element>";
```

This will scan the application entry points, detect the `lit` import, and update the `importmap.js` file with its resolved dependency graph:

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

JSPM's `importmap.js` acts like a lockfile - once packages have been resolved to specific versions, it will retain them at that version. However, it's still recommended to add package version constraints to the package.json file to ensure proper dependency management and to support the `jspm update` command.

## Using Specific Subpaths

Often you may want to import a specific subpath of a package rather than the main entry point. For example, to use just the `html` feature of Lit:

The `jspm ls` command can be used to inspect what versions and entry points of packages are available:

```
jspm ls lit -f html
```

This will show the available subpaths containing "html":

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

Now updating the code to import just this subpath:

_src/index.ts_

```javascript
import { html, render } from "lit/html.js";

const template = html`<div>Hello from Lit HTML!</div>`;
render(template, document.body);
```

Run `jspm install` to update the import map with this more specific import:

```
jspm install
```

## Using Conditional Environments

JSPM supports conditional environments for different build modes, such as development and production. This feature leverages [Node.js conditional exports](https://nodejs.org/dist/latest-v19.x/docs/api/packages.html#conditional-exports) to provide different module implementations based on the environment.

The default conditional environment for JSPM is `["browser", "development", "module"]`. To switch to production mappings, use the `--conditions` flag:

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

Notice how the _development_ prefix is no longer present in the module paths. This allows packages to provide different implementations for development and production.

## Import Map Integrity for Security

For security, it's recommended to generate import maps with the [`"integrity"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap#integrity_metadata_map) field populated.

This field provides Subresource Integrity hashes for all modules in both the static and dynamic module graph of the application, protecting against compromised or malicious CDN resources.

Add the `--integrity` flag to any install operation:

```
jspm install -C production --integrity -o importmap.production.js
```

This creates a separate `importmap.production.js` with integrity hashes:

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

## Working with Different Package Providers

A "provider" in JSPM is a source for JavaScript packages. The default provider, `jspm.io`, is an ESM-native CDN that optimizes dependencies for production and automatically converts CommonJS packages to ES modules.

JSPM supports multiple providers that you can switch between depending on needs:

### Using the nodemodules Provider

To use local `node_modules` from npm as the package source:

1. Install dependencies locally with npm:

```
npm install lit es-module-shims
```

2. Switch to the nodemodules provider:

```
jspm install --provider nodemodules
```

This results in an `importmap.js` that references the local `node_modules` folder:

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

You can also use other CDN providers. For example, to use UNPKG:

```
jspm install -p unpkg
```

JSPM supports `jspm.io`, `nodemodules`, `esm.sh`, `unpkg`, `skypack`, and `jsdelivr` package providers by default. Custom providers can be configured programmatically in the JSPM Generator library.

> `jspm.io` is still recommended for compatibility, but it is just a matter of time before ESM-first workflows make it much easier to switch providers.

## Building for Production

JSPM understands the project's conventions and entry points, allowing it to build the entire package without additional configuration:

```
jspm build
```

This runs RollupJS against the entry points, producing an optimized copy of the package in the `dist` folder. You can control which files are included or excluded using the `"ignore"` and `"files"` fields in package.json.

To create an import map for the built package with preload tags for optimal performance:

```
jspm install --dir dist -C production --integrity --preload -o app.html
```

This generates a production-ready HTML page:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <script
      async
      src="https://ga.jspm.io/npm:es-module-shims@2.5.1/dist/es-module-shims.js"
      crossorigin="anonymous"
      integrity="sha384-Nce024cgIpt9LvkSDb7frhgilsi92irFYd1JDLfjX5R3Ozrad+5TTxeszg5f+WtQ"
    ></script>
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
    <link
      rel="modulepreload"
      href="./dist/src/index.js"
      integrity="sha384-wx/myYGGnUfXlCxJwYrPM42cKPKgodMDRmvrfSkApslhw67eQSUNgoYmLM7Edbsy"
    />
    <link
      rel="modulepreload"
      href="https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/css-tag.js"
      integrity="sha384-yawoKnICWh5SyKPJlj47kOQj7ybzJ9CgSSJ2Auq37QyaMpqAqBy+HCOtHf6QSWKl"
    />
    <link
      rel="modulepreload"
      href="https://ga.jspm.io/npm:@lit/reactive-element@2.1.0/reactive-element.js"
      integrity="sha384-+PmQcPI0ujsCr7U/4NZXVH/i2/LRYjnJYfGjo4fXvYxmwMVycRQZ+Wh4TAQ/1o9s"
    />
    <link
      rel="modulepreload"
      href="https://ga.jspm.io/npm:lit-element@4.2.0/lit-element.js"
      integrity="sha384-xfzuCGvBA/QtAtuRtqiLcIsxDpQiQj+MzJVRhA0kw913TYcYzIB31PY9OIypK7gl"
    />
    <link
      rel="modulepreload"
      href="https://ga.jspm.io/npm:lit-html@3.3.0/is-server.js"
      integrity="sha384-c2UPp3lPxy1SKxJFIPcaK7PaWWWohEEwAaeBsoYeIF7ULocdSenWqg/7Iln4Dkw5"
    />
    <link
      rel="modulepreload"
      href="https://ga.jspm.io/npm:lit-html@3.3.0/lit-html.js"
      integrity="sha384-kPZntmv98MkUK0U+5niOLNQAQAK3WE0mqaX/br00elXsAxlcHvv5IQsZHFdHRAWH"
    />
    <link
      rel="modulepreload"
      href="https://ga.jspm.io/npm:lit@3.3.0/index.js"
      integrity="sha384-IZzW+Sfdx55gIfvWXINdnp5aNwUifd4IB0ROrRyipc+QWqXXpJhcbmT2+7tx9CCN"
    />
  </head>
  <body></body>
</html>
```

### Creating a Single Bundle with Dependencies

If you prefer a single bundle with all dependencies included instead of using an import map, you can control this by moving dependencies to `devDependencies` in the package.json:

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

Then run `jspm build` again, and the output package will be optimized with all dependencies included, eliminating the need for an import map.

### Support for CSS and JSON Imports

JSPM fully supports native CSS imports:

```js
import style from './style.css' with { type: 'css' };

if (!document.adoptedStyleSheets.includes(style))
  document.adoptedStyleSheets.push(style);
```

And JSON imports:

```js
import json from './data.json' with { type: 'json' };
```

These are properly handled in build workflows, with CSS assets being correctly rebased during the build process.

## Browser Compatibility

JSPM works natively in browsers that support import maps, which includes:

- Chrome 89+
- Edge 89+
- Safari 16.4+
- Firefox 108+

If using the injection script import map, this requires multiple import maps support which only works natively in Chrome 135+ currently.

If using CSS or JSON imports, these work in

[ES Module Shims](https://github.com/guybedford/es-module-shims) is a production suitable polyfill for older browsers in all of the above cases though, so it is recommended to use it in production for this reason.

With ES Module Shims the latest features are supported on all of:

- Chrome 63+
- Edge 63+
- Safari 11.1+
- Firefox 67+

## Deployment

To deploy a JSPM application:

1. Run a production build with integrity hashes:

   ```
   jspm build
   jspm install --dir dist -C production --integrity -o index.html
   ```

2. Upload the generated files to a web server or hosting provider. Required files include:

   - The generated HTML file (e.g., index.html)
   - Your application code in the dist directory
   - Any static assets referenced by the application

3. For optimal performance, configure the server to:
   - Set appropriate cache headers for static resources
   - Enable HTTP/2 for parallel loading of modules
   - Use compression (gzip or brotli) for all text-based resources

With these steps, you'll have a production-ready application that leverages the performance and security benefits of import maps.

There is also support for a `jspm deploy` using the provider system for deployments. This in in early access - try it out via `jspm deploy -p jspm.io`.

## Next Steps

- [CLI Documentation](/jspm-cli) - Reference for all JSPM CLI commands
- [Online Generator](/integrations#online-generator) - Try the import map generator without installing the CLI
- [FAQ](/faq) - Answers to common questions about JSPM and import maps
- [GitHub Repository](https://github.com/jspm/jspm) - View the source code and contribute to JSPM
- [Issue Tracker](https://github.com/jspm/jspm/issues) - Report bugs or request features
