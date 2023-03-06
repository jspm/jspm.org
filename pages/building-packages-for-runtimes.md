+++
title = "Building packages for multiple runtimes"
description = "Building javascript packages for respective runtimes, for better compatability and cross-platform usage."
prev-section = "import-map-cdn"
next-section = "jspm-dev-release"
+++

# Building packages for multiple runtimes

**Author:** Jaya Krishna Namburu ([@askjkrishna](https://github.com/JayaKrishnaNamburu))

One of the great things about JavaScript is how easy it is to share modules. With the use of package managers like `npm`, developers can easily publish their code as packages and share them with the world and distribute them across with global cdn’s like `jspm`.

This makes it easy for other developers to reuse the code in their own projects, saving time and effort. Additionally, the open-source nature of many of these packages means that they can be constantly improved and updated by the community. All in all, this makes JavaScript a powerful and collaborative language for building applications.

However, there was no defined way on how these modules should be written and distributed. With JavaScript now able to run on multiple runtimes - including `browsers`, `node`, `deno`and `mobile` - and each runtime environment has it’s own built-ins to work with, so there was a need to establish standard practices.

We have different standardising bodies for various adoptions in javascript eco-system. For example, [tc39](https://tc39.es/) is responsible for standardising and proposing changes to the JavaScript language. Meanwhile, [w3c](https://www.w3.org/standards/) and [node-tsc](https://github.com/nodejs/TSC) take care of standards in browsers and Node.js, respectively.

Simple words with an example

- file-system(fs) is available in node, but not in browsers.
- document(DOM) is available in browsers but not in node.

These are runtime specific things which are dependent on the environment. Since its javascript everywhere there is no restriction on using a js module written for browser to be used in node or deno or any other runtime. So, package authors started using [polyfills](https://developer.mozilla.org/en-US/docs/Glossary/Polyfill). But, adding polyfills into the module itself and publishing them have it’s own down sides.

## Built-ins

Let’s say we are building a package for authentication layer, that needs to be used in browser and node environments. If we follow the polyfills process.

- We use `node-fetch` for making fetch calls in nodejs, this get bundled into module. But, browsers have it’s own implementation of `fetch` it don’t need to rely on any third party of polyfills to enable this.
- And if each `npm` package is bundling it’s own polyfills, the dependencies get’s bloated up. Every module in the `node_modules` will keep bringing its own duplication of polyfills causing build size to increase.
- If the modules don’t do it, the end users when consuming it need to install the `polyfills` by themselves.

With the recent additions to the package specifications. Building packages for different runtimes is easier now. Let’s look at some of the cases on how we can build better packages.

### imports

With the addition of import paths [mapping](https://nodejs.org/docs/latest-v16.x/api/packages.html#imports) in `node v16`. We can define a dependency to use depending on if the module is running in `browser` or `node`.

So, a fetch can be mapped using

```json
{
  "name": "@example/authentication",
  "type": "module",
  "imports": {
    "#middleware": {
      "node": "./middleware.js",
      "default": "./middleware-browser.js"
    }
  }
}
```

And the independent implementations cab be independent for both the environments.

```jsx
// middleware-browser.js
export const authenticate = () => {
  return fetch("https://example.com/authenticate");
};
```

```jsx
// middleware.js
import fetch from "node-fetch";

export const authenticate = () => {
  return fetch("https://example.com/authenticate");
};
```

When we are consuming authenticate inside the module. We need to import using

```jsx
import { authenticate } from "#middleware";
```

this will take care of loading the module that is specific to environment. By following these patterns, we can reduce the reduplication of polyfills and use native modules in their respective environments.

**Example**

Let’s looks at an example how, `chalk` one of the most used package uses these `imports` and loads the built-ins efficiently.

Here is `imports` from the `package.json`

```json
"imports": {
  "#ansi-styles": "./source/vendor/ansi-styles/index.js",
  "#supports-color": {
    "node": "./source/vendor/supports-color/index.js",
    "default": "./source/vendor/supports-color/browser.js"
  }
}
```

<img style="width: auto; height: 400px" src="./chalk.gif" alt="Gif to show generation of import-map for chalk. (package)" />

> `https://ga.jspm.io/npm:chalk@5.2.0/source/vendor/supports-color/index.js` > `https://ga.jspm.io/npm:chalk@5.2.0/source/vendor/supports-color/browser.js`

## Exports

In addition to the `imports` field, there is also an `exports` field in the `package.json` file that allows package authors to specify how their package should be imported in different environments. The `exports` field allows authors to specify different entry points for different runtimes(browser, node, default), as well as different formats (such as CommonJS or ES modules) for the same entry point. This allows for more efficient loading and usage of packages in different environments.

Don’t get confused between `imports` and `exports`. Imports are for using runtime aware external packages into your module. Whereas `exports` are used to expose your module in different environments making it work across runtimes and formats.

A example of exports filed can be found in

[https://github.com/preactjs/preact/blob/master/package.json](https://github.com/preactjs/preact/blob/master/package.json)

```json
"type": "module",
"exports": {
  ".": {
    "types": "./src/index.d.ts",
    "browser": "./dist/preact.module.js",
    "umd": "./dist/preact.umd.js",
    "import": "./dist/preact.mjs",
    "require": "./dist/preact.js"
  }
}
```

**Open specifications**

[WinterCG](https://wintercg.org/) the collaboration platform for different javascript runtimes is in the process of standardising these runtime keys. Here is the [specification](https://runtime-keys.proposal.wintercg.org/) for more details. The proposed specification tries to bring in more identifiers for the different runtimes. This helps in optimising the packages by taking advantages of the built-ins that are available in the target runtime. And adding polyfills for those which are only needed.

## ENV

While bundling for projects, it’s a common practice that we use `process.env.NODE_ENV` to have different builds for `production` and `development`. Well, this is common practice in building applications, but when packaging for libraries, this becomes a problem. As `process` is note a browser built-in. It is of the best interest for the authors of these libraries to serve different versions in different build targets to give better error messages. Better build sizes etc. Trying load these in browsers directly from CDN’s crashes the module.

One example is, by trying load `react-router@5.2.0` into the browser as `esm` module. Fails to load it, as the `entry` uses `process.env.NODE_ENV`

[https://unpkg.com/browse/react-router@5.2.0/index.js](https://unpkg.com/browse/react-router@5.2.0/index.js)

```jsx
// react-router/index.js
if (process.env.NODE_ENV === "production") {
  module.exports = require("./cjs/react-router.min.js");
} else {
  module.exports = require("./cjs/react-router.js");
}
```

This is handled, if we are importing the process from `node:process` . Then bundlers and CDN’s which build these packages will be able to detect these built-ins usage. And polyfill them accordingly.

So, the above snippet can become

```jsx
import process from "node:process";

if (process.env.NODE_ENV === "production") {
  module.exports = require("./cjs/react-router.min.js");
} else {
  module.exports = require("./cjs/react-router.js");
}
```

This kinda of context and env aware of usage of built-ins. Will give better control for the bundlers to polyfill only the modules that are actually needed. Instead of polyfilling all the node built-ins every time a build is carried out for browsers.

## JSPM

We have seen multiple use cases for improving package compatibility within the ecosystem. Now, let's examine how `jspm` handles pre-existing packages in npm. It’s a well known issue when esm modules went into stable. The transition was not at all smooth in the eco-system. Because, for a project to work in js eco-system now.

The build pipelines became so complex, it’s a proper combination of `bundlers`, `transpilers`, `node` and multiple module `formats`. Loading a `cjs` module from `npm` into project that is configuring to build as `esm` and vice-versa became so complex. At some point left most of the systems out of sync.

`JSPM` builds all packages from `npm` ahead of time to spec complaint esm modules. And serves them using a distributed global CDN, regardless of the format in which the packages are published to npm. This makes it seamless for loading any module from `npm` and use it in any project at anytime.

**Fields inside package.json**

**browser**

If a package is specifying [browser](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#browser) field in the package.json. And when these packages are used in generating `import-maps` for browser as target. Then jspm uses this field instead of `main`, as the package authors explicitly stating the module that needs to be used when loading the same build inside a browser environments.

**module**

Module build detection in jspm. Let’s say, we are exposing `cjs` build from `main` and `esm` version in `module` field. And we don’t have `type` as `module` set on the package. Nor, the entry point is ending with `.mjs` extension. Something like below

```json
"main": "dist/index.js",
"module": "dist/index.es.js"
```

This is one of the most used pattern in publishing packages. The builder uses `main` entry and builds the module into `esm` . This is because the `module` field is not in official specification but mostly used by `bundlers`. JSPM always follows the node specification.

**exports**

The package-builder from jspm parses the packages and creates an `export-map` for those packages which don’t expose them by itself. In the process, the builder is even intelligent enough to detect [subpaths](https://nodejs.org/api/packages.html#subpath-patterns) depending on the usage of the module imports internally. Which in return makes the package exports more efficient.

> If the package is exposing an `exports` map, JSPM uses it instead of re-generating the whole export map.

```json
"exports": {
    ".": {
      "import": "./dist/default/lib.mjs",
      "require": "./dist/default/lib.js",
      "umd": "./dist/default/lib.umd.js"
    }
}
```

Let’s look it with an example with `react-router`. If we look into the `package.json` of the package

[https://unpkg.com/browse/react-router@6.8.2/package.json](https://unpkg.com/browse/react-router@6.8.2/package.json)

```json
"main": "./dist/main.js",
"unpkg": "./dist/umd/react-router.production.min.js",
"module": "./dist/index.js",
"types": "./dist/index.d.ts"
```

Let’s load the same `package.json` from `jspm`.
[https://ga.jspm.io/npm:react-router@6.8.2/package.json](https://ga.jspm.io/npm:react-router@6.8.2/package.json)

```json
"exports": {
    ".": {
      "module": "./dist/index.js",
      "default": {
        "development": "./dist/dev.main.js",
        "default": "./dist/main.js"
      }
    },
    "./package.json": "./package.json.js",
    "./package": "./package.json.js",
    "./dist/main.js": {
      "development": "./dist/dev.main.js",
      "default": "./dist/main.js"
    },
    "./dist/index.js": "./dist/index.js",
    "./dist/main.js!cjs": "./dist/main.js",
    "./dist/dev.main.js!cjs": "./dist/dev.main.js",
    "./package.json.js!cjs": "./package.json.js"
  }
```

export maps help in loading the modules more efficiently using `import-map`. Let’s explore more of how these import maps helps in loading modules into any environment in the up-coming series.
