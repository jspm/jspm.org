# JSPM Workflows

This guide covers practical workflows for using JSPM and import maps from development to production.

These workflows are based on the JSPM starters repo located at https://github.com/jspm/jspm-starters.

## Native Modules Development Workflow

> This workflow follows the [React Starter](https://github.com/jspm/jspm-starters/tree/master/react).

Developing with pure native modules requires just a web server, a browser and an editor.

Instead of building JavaScript, the modules are all loaded by the browser directly.

### Adding an Import Map

When loading third-party code, we use import maps to tell the browser that an import like `import React from 'react'` should actually be fetched from `https://ga.jspm.io/npm:react@17.0.1/index.js`.

The import map to do this would look like:

```html
<script type="importmap">
{
  "imports": {
    "react": "https://ga.jspm.io/npm:react@17.0.1/index.js"
  }
}
</script>
```

In reality, we need both React and ReactDOM and these packages in turn depend on other third-party packages requiring their own mappings in turn.

These shared mappings are useful because it enables dependencies to be shared both between local code and different third-party modules.

_Import map management becomes a form of package management in the browser._

Here's what a full React import map looks like output from [JSPM Generator](https://generator.jspm.io/#Y2VgYGBiDkpNTC5RCC5JLCpJLWIoAvF0U/JzHQzN9Qz0DCECUA4A8Cd9GjEA) for a React development environment:

```html
<!--
  JSPM Generator Import Map
  Edit URL: https://generator.jspm.io/#Y2VgYGBiDkpNTC5RCC5JLCpJLWIoAvF0U/JzHQzN9Qz0DCECUA4A8Cd9GjEA
-->
<script type="importmap">
{
  "imports": {
    "react": "https://ga.jspm.io/npm:react@17.0.1/dev.index.js",
    "react-dom": "https://ga.jspm.io/npm:react-dom@17.0.1/dev.index.js"
  },
  "scopes": {
    "https://ga.jspm.io/": {
      "object-assign": "https://ga.jspm.io/npm:object-assign@4.1.1/index.js",
      "scheduler": "https://ga.jspm.io/npm:scheduler@0.20.1/dev.index.js",
      "scheduler/tracing": "https://ga.jspm.io/npm:scheduler@0.20.1/dev.tracing.js"
    }
  }
}
</script>
```

The scopes entry in the import map allows defining import mappings that only apply when resolved by modules contained within the scope. For example in the above map, `import 'object-assign'` wouldn't resolve in the local HTML page, but would resolve for any module contained within `https://ga.jspm.io/`, as is handled by React and its dependencies.

> Currently Chrome 89+ only supports import maps written _inline_ like the above example.
  Support for `<script type="importmap" src="external.json"></script>` is specified but still a pending browser feature.

### Writing Native Modules

With the import map in place, the JS module can be included itself with a `<script type="module" src="app.js"></script>` tag.

Writing the `app.js` file we can include our hello world example:

```js
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
  React.createElement('h1', { children: 'Hello world!' }),     
  document.getElementById('root')
);
```

### Setting up a Local Server

If you have [Node.js installed](https://nodejs.org), a local server can be run with `npx http-server -c-1` (the `-c-1` flag is useful to disable caching during development). This server is then the only step necessary to get going on a simple web application development workflow with native modules - no other tooling is required apart from the web browser and editor.

Navigate to `http://localhost:8080/index.html` to load the application in the browser.

> Of course, use whatever hosting and serving mechanism you prefer - it is the open web after all. It is even possible to use new protocols in browsers like [IPFS](https://ipfs.io/) or [Beaker Browser](https://beakerbrowser.com/) to deploy applications directly to the decentralized web without needing any local command line tooling.

### Creating a Production Import Map

React ships separate development and production builds, so when shifting to production it is important to configure this.

Loading up the [development version of the React import map](https://generator.jspm.io/#Y2VgYGBiDkpNTC5RCC5JLCpJLWIoAvF0U/JzHQzN9Qz0DCECUA4A8Cd9GjEA) in JSPM Generator, there's an "Environment Conditions" box at the bottom of the sidebar. This allows configuring which [conditional exports](/docs/cdn#conditional-exports) to use.

Clicking the "Production" condition will then update the import map to use the production sources:

```html
<!--
  JSPM Generator Import Map
  Edit URL: https://generator.jspm.io/#Y2NgYGBiDkpNTC5RCC5JLCpJLWIoAvF0U/JzHQzN9Qz0DCECUA4AhFDkUDEA
-->
<script type="importmap">
{
  "imports": {
    "react": "https://ga.jspm.io/npm:react@17.0.1/index.js",
    "react-dom": "https://ga.jspm.io/npm:react-dom@17.0.1/index.js"
  },
  "scopes": {
    "https://ga.jspm.io/": {
      "object-assign": "https://ga.jspm.io/npm:object-assign@4.1.1/index.js",
      "scheduler": "https://ga.jspm.io/npm:scheduler@0.20.1/index.js"
    }
  }
}
</script>
```

> Only some packages have production variants, usually the library or framework will mention this in its documentation or in a console message.

The JSPM CDN is suitable for production workflows because all packages are optimized with code splitting and fully minified.

For small applications it is even possible to get away with leaving the local code as separate modules (and the JSPM sandbox and generator apps even do this).

For larger applications you will always want to look at applying code optimizations for production, see the [RollupJS optimization](#optimization-with-rollupjs) section below for more information. The important point here is that these further optimizations are optional and additive to the workflow later on. By using native standards it is more likely you can apply a wider variation of optimization tools as well.

## Import Maps Polyfill

By default JSPM Generator will include a boilerplate HTML template that contains the [ES Module Shims](https://github.com/guybedford/es-module-shims) import map polyfill.

The polyfill will just do feature detections in modern Chrome, and if import maps aren't supported it replaces the imports with their actual URLs and executes them again.

Because of this, in browsers without support for import maps you'll see a console error message like:

```js
Uncaught TypeError: Failed to resolve module specifier "react". Relative references must start with either "/", "./", or "../".
```

This is correct and means the polyfill is working!

If you're using a logging service or don't want these errors, add the `-shim` suffix to your import map and module scripts:

```html
<script type="importmap-shim">
...
</script>
<script type="module-shim" src="app.js"></script>
```

Note that ES Module Shims only works in browsers with basic native modules support (it polyfills import maps on top of basic modules) - which is around [93% of all browsers](https://caniuse.com/es6-module) (and higher on desktop).

ES Module Shims is very fast and perfectly suitable for production workflows. The cost is that it adds around 7KB to the page load, and for large applications (500-1000 modules) can start to add a slight performance overhead of a few 100 ms.

## SystemJS

> This workflow follows the [SystemJS Babel Starter](https://github.com/jspm/jspm-starters/tree/master/systemjs-babel).

For support in older browsers even without ES modules at all (including IE11), SystemJS can be used and there's an entire variant of the CDN serving System modules which can work in older browsers for this (depending on library support).

Building modules into SystemJS can be achieved with Babel by first installing Babel CLI and the System transform:

```
npm install --save-dev @babel/core @babel/cli @babel/plugin-transform-modules-system
```

Then to use Babel CLI, run the following command (add the `--watch` flag for watch mode):

```
./node_modules/.bin/babel src --out-dir dist/system --plugins=@babel/plugin-transform-modules-systemjs
```

> Usually we put commands like the above in the `package.json` `"scripts"` field. This avoids having to include the `./node_modules/.bin` prefix as well. See the starter for how to set this up.

This will compile all the modules in the `"src"` folder into `"dist/system"` as System modules.

Finally load up the [example import map in JSPM Generator](https://generator.jspm.io/#Y2VgYGBiDkpNTC5RCC5JLCpJLWIoAvF0U/JzHQzN9Qz0DCECUA4A8Cd9GjEA) and select the **SystemJS Import Map** output option at the top.

Update the import map and reference to the main module to point to the `dist/system/app.js` file:

```html
<!--
  JSPM Generator Import Map
  Edit URL: https://generator.jspm.io/#M2VgYGBiDkpNTC5RCC5JLCpJLWIoAvF0U/JzHQzN9Qz0DCECUA4ANkXMaDEA
-->
<script type="systemjs-importmap">
{
  "imports": {
    "react": "https://ga.system.jspm.io/npm:react@17.0.1/dev.index.js",
    "react-dom": "https://ga.system.jspm.io/npm:react-dom@17.0.1/dev.index.js"
  },
  "scopes": {
    "https://ga.system.jspm.io/": {
      "object-assign": "https://ga.system.jspm.io/npm:object-assign@4.1.1/index.js",
      "scheduler": "https://ga.system.jspm.io/npm:scheduler@0.20.1/dev.index.js",
      "scheduler/tracing": "https://ga.system.jspm.io/npm:scheduler@0.20.1/dev.tracing.js"
    }
  }
}
</script>

<!-- Load an app.js file written in the "system" module format output (via RollupJS / Babel / TypeScript) -->
<script type="systemjs-module" src="dist/system/app.js"></script>
```

The promise of SystemJS is that if it worked with native modules and a native import map, it will work just the same on SystemJS.

## Optimization with RollupJS

> This workflow follows the [Rollup Starter](https://github.com/jspm/jspm-starters/tree/master/rollup).

As the number of modules in your application grows there can start to be performance benefits to combining modules together that always load together into a single module.

While HTTP/2 makes it possible for very large numbers of requests, there are still per-request overheads and code and network optimizations that benefit from combining modules together.

RollupJS (and other build tools) can do this module combination for us, including working out which modules can be combined together.

First, install RollupJS:

```
npm install rollup --save-dev
```

Next create a `rollup.config.js`:

rollup.config.js
```js
export default {
  // Add extra entry points here if there are multiple to build
  input: ['src/app.js'],

  output: [
    // ES module build
    {
      dir: 'dist/esm',
      format: 'esm'
    },
    // SystemJS build
    {
      dir: 'dist/system',
      format: 'system'
    }
  ],

  // disable external module warnings
  // (JSPM / the import map handles these for us instead)      
  onwarn (warning, warn) {
    if (warning.code === 'UNRESOLVED_IMPORT')
      return;
    warn(warning);
  }
};
```

To start the build, run (add the `-w` flag for watch mode):

```
./node_modules/.bin/rollup -c
```

If `app.js` were to import 20 separate modules, all of these modules would now be just one single module file.

RollupJS will output this to `dist/esm/app.js` for the ES module build and `dist/system/app.js` for the SystemJS build (output can also just be a single object to just have one output format per the project requirements).

If we had two separate pages of the application, say `src/homepage.js` and `src/shop.js`, then passing both of these to RollupJS it would automatically work out which dependencies are only
dependencies of `src/homepage.js` and which are only dependencies of `src/shop.js`. Shared dependencies between both would be split out into a separate module dependency chunk. The great thing about
RollupJS is that it is a very stable reliable project - a lot of engineering over years of development has gone into making these cases all work out well.

Update the main application module scripts to reference the build folder, or even configure this in the import map via an `"app"` entry in the `"imports"` object.

## TypeScript

> This workflow roughly follows the [TypeScript Starter](https://github.com/jspm/jspm-starters/tree/master/rollup), although takes a different direction with file extensions.

Many JS developers use TypeScript for the immense development benefits of comprehensive type checking it provides. For larger applications this benefit can be indispensible.

First, install TypeScript:

```
npm install typescript --save-dev
```

Create the following `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "target": "es2017",
    "module": "esnext",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

TypeScript files always use the `.ts` file extension, but the first big decision when it comes to TypeScript is then if you want to _import_ modules using the `.ts` file extension or the `.js` extension, there are some pros and cons here:

* Deno and some other browser projects use `import './dependency.ts'` to import TypeScript, so if writing code that will be shared with these kinds of environments you'll want to do this.
* If not using the `.ts` file extension, then a build workflow will always be needed to run the TypeScript (SystemJS does provide a development-mode TypeScript loader, demonstrated in the starter).

> We keep waiting for the day TypeScript just provides a configuration option for handling `.ts` -> `.js` extensions in the build...

Unlike the starter, let's use the TypeScript-recommended `.js` file extensions to demonstrate the workflow.

So if writing an `app.ts` that imports a local `dependency.ts` file, this would be written:

```js
// we import dependency.js EVEN THOUGH it is dependency.ts
import './dependency.js';
```

Run the compilation with (add `-w` for watch mode):

```
tsc -p .
```

This will create `dist/app.js` and `dist/dependency.js`, and now that it is compiled, the `./dependency.js` import points to the correct file.

Using the import map and boilerplate as per the previous examples, and updating the module script to reference `dist/app.js`, the application can now run natively in the browser with no other steps necessary.

> Using the `"module": "system"` option it is also possible to output SystemJS modules directly from TypeScript. See the starter repo for the full example.
