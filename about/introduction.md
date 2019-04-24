# jspm 2.0 Beta Release

<p style="text-align: right; margin-top: -4em; margin-bottom: 4em; font-size: 0.9em;"><em>25 April 2019&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</em></p>

## What is jspm

jspm is designed to provide the npm-style JavaScript workflows of _install and require_ directly in the browser. In the previous jspm 0.16 and 0.17 releases, these workflows were provided through the now deprecated WhatWG Loader API.

[Import maps](https://github.com/wicg/import-maps) are the new way of defining module resolution in the browser, which have just been implemented in Chrome 74 under the _Experimental Web Platform Features_ flag, marking a major step in bringing package dependency resolution to the browser.

_The new jspm 2.0-beta release directly enables loading packages in the browser without a build step using import maps, while providing compatibility with the standard JavaScript workflows we know today._

## Browser-Native Package Management

When installing npm packages with jspm, CommonJS is automatically converted into ES modules using a transformation called a [Deferred Execution Wrapper](https://github.com/jspm/babel-plugin-transform-cjs-dew) that supports CommonJS semantics including for example, exact support for CJS circular references. The installed packages are laid out in flat, versioned `jspm_packages/[regstry]/[name]@[version]` folders which are symlinked to the global cache. Having versioned `jspm_packages` URLs allows them to be cached and properly shared between packages in the browser. The other benefit of this flat `jspm_packages` is that the packages are symlinked to a single global cache, avoiding the file size bloat caused by having a full copy of `node_modules` per-project.

With `jspm_packages` consisting of native ES modules under versioned URLs, [package import maps can be generated for the browser](/docs/guide#browser-modules-with-import-maps) with the `jspm map` command - which either accepts module arguments to filter the map only to specific packages, or without any arguments to generate one large map representing all the currently installed packages. With the import map loaded in the browser, any installed packages can be imported as ES modules with `<script type="module">` loading, without any build step being necessary, and most npm packages are supported in this way.

## Node.js Compatibility

JavaScript modules can be executed in Node.js with `jspm_packages` resolution using `jspm module.js`. This is effectively an alias for `node --experimental-modules --loader @jspm/resolve/loader.mjs module.js`, which provides the jspm resolver through the loader hooks of the `--experimental-modules` implementation in Node.js, executing the native ES modules directly. The CommonJS conversion into ES modules on install is accurate enough that most npm packages running in Node.js are supported under this command, along with npm `bin` scripts, binary support, and `package.json` `"scripts"`.

In most scenarios, jspm behaves just like any other JS package manager. For the few cases where packages do not work under the jspm CommonJS conversion, [npm or Yarn can still be used side-by-side with jspm](/docs/integrations#npm), with jspm resolution falling back to a `node_modules` resolution in Node.js.

jspm automatically adds a `"type": "module"` field to the local projet `package.json`, so that the support for ES modules in `.js` files remains fully compatible with the [Node.js `--experimental-modules` implementation](http://2ality.com/2019/04/nodejs-esm-impl.html#filename-extensions) - code that runs under jspm can continue to be compatible with the npm ecosystem in future.

## Optimization

Having all packages installed as ES modules significantly improves the JS build experience. There is no need to set up highly custom build steps or handle CommonJS support as it is already handled on install - instead the build is just the process of building ES modules, and resolving their dependencies in `jspm_packages`.

`jspm build` provides a light-weight wrapper around RollupJS that uses [rollup-plugin-jspm](https://github.com/jspm/rollup-plugin-jspm) for `jspm_packages` resolution. Build any package for the browser with just `jspm build ./module.js`. Full support for [RollupJS code splitting](https://rollupjs.org/guide/en#code-splitting) is provided through this command as well by passing multiple modules as entry points or using dynamic import. Adding the `--node` flag to get Node.js build support too. [Optimizing Node.js packages for publishing](/docs/guide#optimizing-nodejs-libraries-for-publishing) is also made much easier with this command.

There are some really interesting ways in which import maps and partial builds can be combined to create different types of optimizations. The primitives provided by `jspm map` and `jspm build`, provide some quite advanced approaches to do this. For example, [dependencies can be optimized and cached separately to application code](/docs/guide#optimized-dependency-builds). Exploring these ES module and import map optimization workflows and primitives further is a primary goal of the project.

## Legacy Browser Workflows

With [85% of browsers](https://caniuse.com/#feat=es6-module) supporting `<script type="module">`, shipping ES modules directly is a viable option so long as the import maps have been optimized out by a build.

For older browsers, [dual modern/legacy builds](/docs/guide#systemjs-legacy-browser-support) can be made by building for the SystemJS module loader, which supports a conversion of all of the ES module semantics even back to IE11.

## CDN

The jspm CommonJS conversion is delivered through a CDN at `https://dev.jspm.io/[package-name]`. Import any package from npm with just a `<script type="module">` tag. See the [sandbox](/sandbox) for some examples.

> To get started with jspm, [see the guide](/docs/guide).