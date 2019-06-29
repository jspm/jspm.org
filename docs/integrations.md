# Tool Integrations

This section, still a work-in-progress, provides sample workflows and links to plugins for jspm support in other tools.

[Provide a PR to this page](https://github.com/jspm/jspm.org/blob/master/docs/integrations.md) to list new tooling and framework integrations here, or to improve or revise an existing one. If you write a plugin for a tooling integration, you can request access to have it transferred into the [jspm organization on GitHub](https://github.com/jspm). If you'd like to work on one of these workflows, but don't know where to start, see the [contributing guide](https://github.com/jspm/project/blob/master/CONTRIBUTING.md).

## Resolver Hook

Integrating a tool that performs module resolution, such as a build tool, requires providing the jspm resolver as a hook or plugin to that tool.

The jspm resolver is maintained as a library at [https://github.com/jspm/jspm-resolve](https://github.com/jspm/jspm-resolve), where the full API details are found at the GitHub page.

## Angular

_Integration workflows pending._

## Babel

To run a jspm build with Babel see the [jspm Rollup build example](#Rollup) which uses Babel.

To run Babel as a precompilation (recommended), use the workflow below.

<details>
<summary>Babel Precompilation Workflow</summary>

> `jspm install` support for Babel CLI currently doesn't work as there is no way to use dynamic `import()` to load the Babel plugins which is required if they are installed with jspm. If and when Babel supports asynchronous / promise-based plugin configuration, then we'll be able to support this. See the tracking issue at https://github.com/babel/babel/issues/9888.

First [separate the jspm and npm dependencies](#npm) in the `package.json`:

```json
{
  "jspm": {
    "dependencies": {}
  }
}
```

Install Babel and any plugins:

```
npm install @babel/core @babel/cli @babel/preset-env --dev
```

Create a `babel.config.js`:

```
module.exports = {
  sourceMap: true,
  presets: ["@babel/preset-env"]
};
```

And set up the `package.json` `"scripts"` entry:

```js
{
  "scripts": {
    "compile": "babel src -d lib",
    "compile-watch": "babel src -d lib --watch"
  }
}
```

`jspm run compile` (or `compile-watch`) will now compile all the individual `src` files to the `lib` directory, where they can then be optimized further [as in the main guide workflows](/docs/guide#optimized-browser-builds).

</details>

## Electron

_Electron workflows pending._

Support for Electron package resolution is provided via the `--electron` flag in all commands that take environment conditions such as `jspm build` and `jspm map`.

## Jest

_Jest plugin pending ([tracking issue](https://github.com/jspm/jspm-cli/issues/2451))._

## Mocha

Mocha tests can be run with a custom jspm test harness. A boilerplate approach for this is provided below.

<details>
<summary>Mocha Test Runner</summary>

```
jspm install mocha
```

Create the following runner in a `test/test.js` file:

```js
import Mocha from 'mocha';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

(async () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const tests = (await fs.readdir(__dirname)).filter(name => name.endsWith('.js'));
  const mocha = new Mocha({
    // Set Mocha options here
  });

  for (const test of tests) {
    mocha.suite.emit('pre-require', global, test, mocha);
    await import('./' + test);
  }

  mocha.run();
})()
.catch(e => {
  console.error(e);
});
```

This can be executed with `jspm test/test.js`, or in the `package.json`:

```json
{
  "scripts": {
    "test": "jspm test/test.js"
  }
}
```

The above will run all `test/*.js` test files through Mocha.
</details>

Support for the Mocha CLI still needs to be provided, likely with some PR work to Mocha itself. This is because Mocha uses `require()` to load tests, which doesn't support ES modules in jspm. If it had a mode to use the ES dynamic `import()` then we could support it fully natively.

## npm

If using npm and jspm in the same project, add a `"jspm"` property to your `package.json` to separate jspm dependencies from npm dependencies:

```json
{
  "jspm": {
    "dependencies": {}
  }
}
```

* `jspm install x`: Will install into `jspm.dependencies` in the `package.json` file.
* `npm install x`: Will install into `dependencies` in the `package.json` file.

Package.json scripts via `jspm run` will support bin files in both `jspm_packages/.bin` falling back to `node_modules/.bin`.

Imports in Node.js throgh `jspm` will also fall back to the `node_modules` resolution before the module not found error.

## Parcel

_Parcel plugin pending._

## React

React will install with jspm and build for the browser, Node.js (`--node`), development or production (`--production`) through `jspm build`.

To support JSX compilation, use a [Babel](#Babel) or [TypeScript](#TypeScript) workflow, with the [Babel JSX Preset](https://babeljs.io/docs/en/babel-preset-react), or setting the `jsx` TypeScript compilation option.

## React Native

_React Native workflows pending._

jspm does provide support for React Native resolution through the `--react-native` flag. All commands that support `--browser` and `--node` also support `--react-native` to resolve the React Native package main in dependencies.

## Rollup

The Rollup plugin for jspm is [rollup-plugin-jspm](https://github.com/jspm/rollup-plugin-jspm).

`jspm build` provides a simple wrapper around this plugin, but for more advanced build workflows you'll typically want to use this plugin directly. A sample dual-build workflow is provided below.

<details>
<summary>Babel Build with rollup-plugin-jspm</summary>

Install Rollup, The [Rollup jspm plugin](https://github.com/jspm/rollup-plugin-jspm), and [Rollup Plugin Babel](https://github.com/rollup/rollup-plugin-babel):

```
jspm install rollup rollup-plugin-jspm rollup-plugin-babel@latest --dev
```

Install babel plugins/presets using npm due to https://github.com/babel/babel/issues/9888. Read more under [Babel](#Babel) section.

```
npm install --save-dev @babel/preset-react
```

Create the following `rollup.config.js` file:

```js
import jspm from 'rollup-plugin-jspm';
import babel from 'rollup-plugin-babel';

export default {
  // Leading "./" still important here
  input: ['./test.js'],
  output: {
    dir: 'dist',
    format: 'esm'
  },
  plugins: [jspm({
    env: {
      node: true,
      production: true
    }
  }), babel({
    exclude: 'jspm_packages/**'
  })]
};
```

Run `jspm_packages/.bin/rollup -c` or setup the `package.json` `"scripts"` entry:

```json
{
  "scripts": {
    "build": "rollup -c"
  }
}
```

> In this example we're building for the Node.js production environment (handling the correct resolutions, `process.env.NODE_ENV` etc). By default, jspm will build for the browser development environment.

Further plugins and build customizations can then be added to the above.
</details>

## Svelte

_Integration workflows pending._

## Terser

Terser minification is provided by `jspm build` when passing the `--minify` option.

To use [Terser](https://github.com/terser-js/terser) directly, use the [Terser Rollup plugin](https://github.com/TrySound/rollup-plugin-terser) in a custom [jspm Rollup build](#Rollup).

## TypeScript

TypeScript support can be included through a Rollup, Parcel or Webpack integration, but if you'd like to avoid a monolithic build, running `typescript` directly as a separate step before jspm, can provide a nice incremental workflow where only changed files are build on each rerun.

TypeScript itself needs to be installed with `npm install -g typescript` (jspm support tracking in https://github.com/jspm/jspm-cli/issues/61).

See the workflow below for more details.

<details>
<summary>Direct Incremental TypeScript Compilation</summary>

Since we are installing TypeScript with npm, we should [separate the jspm dependencies from npm dependencies](#npm) in the `package.json`:

```json
{
  "jspm": {
    "dependencies": {}
  }
}
```

Install TypeScript:

```
npm install typescript
```

Installing any dependencies does require installing both the TypeScript types with npm and the jspm version separately:
```
jspm install react
npm install @types/react
```

> You can skip installing the type dependencies, but this will provide compilation errors, even though the compilation will still complete successfully.

Create the `tsconfig.json` file:
```json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "lib",
    "skipLibCheck": true,
    "sourceMap": true,
    "target": "esnext",
    "typeRoots": ["node_modules/@types"],
  },
  "include": [
    "src/**/*.ts",
  ]
}
```

Set up the compilation as a `package.json` script with:

```json
{
  "scripts": {
    "compile": "tsc",
    "compile-watch": "tsc --watch"
  }
}
```

Running `jspm run compile` (or `compile-watch`) will now compile the all `.ts` files in the `"src"` folder to the `"lib"` folder as ES modules. In addition this compilation workflow will be fully incremental, only doing the work it needs to do.

This can then be combined with a `"build"` script to handle optimization or browser mappings. The `"lib"` folder can be treated like the `"src"` folder from the perspective of all the jspm map and optimization workflows as described in the [main guide](/docs/guide). For example, build a single-file browser script build with `jspm build lib/test.js --production -f iife`, etc.

</details>

## Vue.js

Vue.js production builds are supported with `jspm build --production`.

To support `.vue` files, use a custom build workflow like [Rollup](#Rollup) with the [Rollup Vue plugin](https://github.com/vuejs/rollup-plugin-vue).

_Precompilation Vue.js workflow pending._

## Webpack

_Webpack plugin pending ([tracking issue](https://github.com/jspm/jspm-cli/issues/2450))._

## One Weird Trick to Support jspm in Tools

If you're a tooling author, whenever loading or executing code dynamically in CommonJS, use the pattern:

```js
Promise.resolve(require(dynamicModuleExpression))
```

By immediately wrapping the `require` statement in `Promise.resolve()`, and handling the promise properly, jspm will then automatically replace this during CommonJS conversion on install with `import(dynamicModuleExpresion)`, thereby providing comprehensive ES module and dependency resolution for dynamic requires, which would usually be a problem as they are not statically analyzable.

This pattern is exactly what allows RollupJS configuration files to full support loading Rollup plugins as ES modules through jspm, and hopefully other tools can follow.
