+++
title = "Workflow Guides - Documentation"
description = "JSPM workflows overview and introduction"
next-section = "docs/cdn"
prev-section = "index"
+++

# Workflow Guides

Some simple workflows for getting started with JSPM import map generation.

* For quick examples without getting bogged down in local tooling configuration, try the [Online Generator](#online-generator) or [VSCode Extension](#vscode-extension) workflows below.
* The most direct recommended approach for JSPM Generation is the [JS Generator API](#js-generator-api) workflow.
* For a full example local application with TypeScript and a dev server using the Chomp task runner (or alternatively npm scripts), see the [JSPM Starter](#jspm-starter) workflow.
* More advanced experimental [Deno import maps](#deno-import-maps) support is demonstrated as the last workflow.

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

In [this example](https://generator.jspm.io/#U2NhYGBiDs0rySzJSU1hyMkscTDSM9IzQLD0M0pyc/SyigHzBUtSKgA) we get:

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
    Edit URL: https://generator.jspm.io/#U2NhYGBiDs0rySzJSU1hyMkscTDSM9IzQLD0M0pyc/SyigHzBUtSKgA
  -->
  <script type="importmap">
  {
    "imports": {
      "lit": "https://ga.jspm.io/npm:lit@2.2.0/index.js",
      "lit/html.js": "https://ga.jspm.io/npm:lit@2.2.0/html.js"
    },
    "scopes": {
      "https://ga.jspm.io/": {
        "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@1.3.0/reactive-element.js",
        "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@3.2.0/lit-element.js",
        "lit-html": "https://ga.jspm.io/npm:lit-html@2.2.0/lit-html.js"
      }
    }
  }
  </script>
  
  <!-- ES Module Shims: Import maps polyfill for modules browsers without import maps support (all except Chrome 89+) -->
  <script async src="https://ga.jspm.io/npm:es-module-shims@0.12.8/dist/es-module-shims.min.js" crossorigin="anonymous"></script>
  
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

The included [ES Module Shims polyfill](https://github.com/guybedford/es-module-shims) ensures the workflow works in all browsers with native modules support.

## VSCode Extension

For an easy fully local workflow try the [JSPM Generator VSCode Extension](https://marketplace.visualstudio.com/items?itemName=JSPM.jspm-vscode), which is supported as a Web Extension.

This provides a workflow for writing native HTML imports directly, then post-processing the HTML file to insert the generated import map and polyfill.

With the extension installed, create a new VSCode project, with an `app.html` file:

```html
<!doctype html>
<head>
<script type="module" src="./lib/app.js"></script>
</head>
<body>
</body>
```

Then create a new JS file `lib/app.js`:

```js
import lit from 'lit';
console.log(lit);
```

With the editor focus on `app.html` open the VSCode Command Palette (`Ctrl + Shift + P`) and select the `JSPM: Generate Import Map` command

<div style="text-align: center;">
<img src="/steps/vscode-1.png" />
</div>

The first question will be whether to inject preloads and integrity for the generation process, in this case select `No`:

<div style="text-align: center;">
<img src="/steps/vscode-2.png" />
</div>

This preference can also be saved and changed any time from the VSCode JSPM Settings.

The final question is what environments to generate the import map for. The default generation is with the `browser`, `development` and `module` exports conditions, in this case we select a `production` instead of a `development` import map:

<div style="text-align: center;">
<img src="/steps/vscode-3.png" />
</div>

Press return again and the generator will run the complete generation API from within VSCode, modifying the HTML to include the injected import map on completion.

The `app.html` file will then be updated by the extension with the ES Module Shims polyfill and import map tags:

```html
<!doctype html>
<head>
<!-- Generated by @jspm/generator VSCode Extension - https://github.com/jspm/jspm-vscode -->
<script async src="https://ga.jspm.io/npm:es-module-shims@1.4.7/dist/es-module-shims.js" crossorigin="anonymous"></script>
<script type="importmap">
{
  "scopes": {
    "./": {
      "lit": "https://ga.jspm.io/npm:lit@2.2.0/index.js"
    },
    "https://ga.jspm.io/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@1.3.0/reactive-element.js",
      "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@3.2.0/lit-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@2.2.0/lit-html.js"
    }
  }
}
</script>
<script type="module" src="./lib/app.js"></script>
</head>
<body>
</body>
```

Rewriting will carefully respect existing HTML and existing import mappings. The operation is also largely idempotent unless there are resolution differences.

Version ranges will be consulted from any local `package.json` file. The full Node.js resolver rules are supported so it's even possible to use [own-name resolution](https://nodejs.org/dist/latest-v17.x/docs/api/packages.html#self-referencing-a-package-using-its-name) and [package imports resolution](https://nodejs.org/dist/latest-v17.x/docs/api/packages.html#subpath-imports) while respecting custom local import map mappings.

After processing, `app.html` should then be a fully executable HTML application. For production it is usually advisable to use the preload option which will inject integrity as well for static guarantees.

## JS Generator API

The [`@jspm/generator` project](https://github.com/jspm/generator) is the driver of all the workflows here. It provides a CDN agnostic protocol for generating import maps for any local or remote URLs, and even supports custom CDN providers and alternative protocols like IPFS.

To run the generator locally, it can be installed from `@jspm/generator` on npm:

```sh
npm install @jspm/generator
```

The documentation and typings are available from the [project repo](https://github.com/jspm/generator).

Below are two basic usage examples for generating import maps like the online generator and VSCode extension respectively.

### Import Map Generation

In a new project, install the `@jspm/generator`:

```sh
npm install @jspm/generator --save-dev
```

Then edit the `package.json` file to include `"type": "module"` or use an `.mjs` file then write the build script:

jspm-generate.js
```js
import { Generator } from '@jspm/generator';

const generator = new Generator({
  mapUrl: import.meta.url,
  env: ['browser', 'development', 'module']
});

await generator.install('lit');
await generator.install('lit/html.js');

console.log(JSON.stringify(generator.getMap(), null, 2));
```

Running the above, will output the equivalent map that the online sandbox would have provided:

```sh
node jspm-generate.js
```

with output:

```json
{
  "imports": {
    "lit": "https://ga.jspm.io/npm:lit@2.2.0/index.js",
    "lit/html.js": "https://ga.jspm.io/npm:lit@2.2.0/html.js"
  },
  "scopes": {
    "https://ga.jspm.io/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@1.3.0/development/reactive-element.js",
      "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@3.2.0/development/lit-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@2.2.0/development/lit-html.js"
    }
  }
}
```

### HTML Generation

For a full HTML generation workflow, follow the same steps of the previous example, but use the `generate.htmlGenerate` method instead in the `jspm-generate.js` file:

jspm-generate.js
```js
import { Generator } from '@jspm/generator';

const generator = new Generator({
  mapUrl: import.meta.url,
  env: ['browser', 'development', 'module']
});

console.log(await generator.htmlGenerate(`
<!doctype html>
<head>
<script type="module">
import lit from 'lit';
console.log(lit);
</script>
</head>
<body>
</body>
`, {
  htmlUrl: import.meta.url,
  preload: false
}));
```

```sh
node jspm-generate.js
```

with output:

```html
<!doctype html>
<head>
<!-- Generated by @jspm/generator - https://github.com/jspm/generator -->
<script async src="https://ga.jspm.io/npm:es-module-shims@1.4.7/dist/es-module-shims.js" crossorigin="anonymous"></script>
<script type="importmap">
{
  "imports": {
    "lit": "https://ga.jspm.io/npm:lit@2.2.0/index.js"
  },
  "scopes": {
    "https://ga.jspm.io/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@1.3.0/development/reactive-element.js",
      "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@3.2.0/development/lit-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@2.2.0/development/lit-html.js"
    }
  }
}
</script>
<script type="module">
import lit from 'lit';
console.log(lit);
</script>
</head>
<body>
</body>
```

Exactly as per the VSCode Extension above, external module imports via `<script type="module" src="./lib/app.js"></script>` will also be traced and generated and version ranges will be consulted from any local `package.json` file.

The full Node.js resolver rules are supported so it's even possible to use [own-name resolution](https://nodejs.org/dist/latest-v17.x/docs/api/packages.html#self-referencing-a-package-using-its-name) and [package imports resolution](https://nodejs.org/dist/latest-v17.x/docs/api/packages.html#subpath-imports) while respecting custom local import map mappings.

## JSPM Starter

While the previous workflows all show isolated examples of import map generation, the [JSPM Starter repo](https://github.com/jspm/jspm-starter) provides a full featured development example with TypeScript support.

It is recommended to use [Chomp Task Runner](https://chompbuild.com) instead of npm scripts for the starter, which provides Makefile-like incremental builds with caching as well as a dev server.

### Chomp Setup

> This section can be skipped if using traditional npm scripts

First make sure the [Rust Toolchain](https://rustup.rs/) is installed, which can be verified with:

```sh
cargo --version
```

Then install Chomp:

```sh
cargo install chompbuild
```

Once installed verify the Chomp installation:

```sh
chomp --version
```

### Setup

Clone the [jspm-starter](https://github.com/jspm/jspm-starter) repo:

```sh
git clone https://github.com/jspm/jspm-starter
cd jspm-starter
```

Next, run `npm install`.

### npm Scripts Workflow

For the traditional npm scripts workflow, run:

```sh
npm run build
```

Then use your preferred local server to navigate to the `app.html` file to see the working application.

TypeScript is compiled with `tsc` and a local generation API command is run per the [JS API workflow](#js-generator-api) above.

### Chomp Workflow

For the Chomp workflow run:

```sh
chomp build --serve
```

which will spin up a dev server on `http://localhost:5776/`.

The necessary build steps as needed by the task graph will be performed by Chomp as well as serving the project folder.

Open up a browser window (or even the simple browser window in VSCode from the command pallet) and navigate to `http://localhost:5776/app.html`.

You should see a working clickable animated slider. Any changed made will incrementally rebuild - try editing the original TypeScript file in `src/motion-slide.ts`.

Chomp works to a task graph defined in a `chompfile.toml` with Makefile-style invalidation to only incrementally recompile individual files as necessary. Because the JSPM task depends on the `lib` files transitively (which are compiled by TypeScript from `src`), the generator will also automatically rerun as files change to pick up any new resolutions for the import map.

Refreshing the page gives an instant dev workflow (and [hot reloading](https://github.com/guybedford/es-module-shims/pull/269) is on the roadmap).

Here's the `chompfile.toml` for the complete build process:

chompfile.toml
```toml
version = 0.1
default-task = 'build'

extensions = ['chomp@0.1:swc']

[[task]]
name = 'build'
deps = ['app.html']

[[task]]
target = 'lib/#.js'
dep = 'src/#.ts'
template = 'swc'
[task.template-options]
'jsc.target' = 'es2019'
source-maps = false

[[task]]
target = 'app.html'
deps = ['app.html', 'lib/**/*.js']
engine = 'node'
run = '''
import { Generator } from '@jspm/generator';
import { readFile, writeFile } from 'fs/promises';
import { pathToFileURL } from 'url';

const generator = new Generator({
  mapUrl: pathToFileURL('app.html'),
  env: ['production', 'browser', 'module']
});

const htmlSource = await readFile('app.html', 'utf-8');

await writeFile('app.html', await generator.htmlGenerate(htmlSource, {
  preload: true,
  integrity: true
}));
'''
```

SWC is used to compile TypeScript using an SWC template provided by the `chomp@0.1:swc` [Chomp extension](https://github.com/guybedford/chomp-extensions). The `#` symbol means the task is interpolated with a glob over all files - SWC is run individually on each file just like a Makefile would do.

Each task optionally defines its targets and dependencies which informs the caching rules and forms a graph of tasks to run with maximum parallelism. Tasks have a `run` field which can be shell or JavaScript code that should run to execute the task.

The JSPM task is expanded for understandability, but there is actually a JSPM Chomp extension we could use instead to give the Chompfile:

```toml
version = 0.1
default-task = 'build'

extensions = ['chomp@0.1:jspm', 'chomp@0.1:swc']

[[task]]
name = 'build'
deps = ['app.html']

[[task]]
target = 'lib/#.js'
dep = 'src/#.ts'
template = 'swc'
[task.template-options]
'jsc.target' = 'es2019'
source-maps = false

[[task]]
target = 'app.html'
deps = ['app.html', 'lib/**/*.js']
template = 'jspm'
[task.template-options]
env = ['production', 'browser', 'module']
preload = true
integrity = true
```

While somewhat magical, template extensions can always be ejected to see their real task definitions. Try updating the Chompfile to the above then running `chomp --eject` to see this in action.

### Chomp Resources

For more information about Chomp, resources are provided below:

* [Getting Started](https://github.com/guybedford/chomp#getting-started)
* [Chomp CLI](https://github.com/guybedford/chomp/blob/main/docs/cli.md)
* [Chompfile Definition](https://github.com/guybedford/chomp/blob/main/docs/chompfile.md)
* [Task Definitions](https://github.com/guybedford/chomp/blob/main/docs/task.md)
* [Chomp Extensions](https://github.com/guybedford/chomp/blob/main/docs/extensions.md)

## Deno Import Maps

Since CommonJS -> ESM conversion and conditional environment resolution is an integral part of the JSPM import map generation, constructing import maps to support execution of npm packages in Deno or other non-browser environments is possible using the same techniques.

This provides a novel mechanism for executing npm packages in Deno, thanks to the ability to support [JSPM Core](https://jspm/jspm-core) to link against the [Deno shims of the Node.js standard libraries](https://github.com/denoland/deno_std/tree/main/node).

For example, let's run `@jspm/generator` itself in Deno.

This example again uses [Chomp](https://chompbuild.com) but the any generation API from these workflows can be used equivalently as long as the environment is set to `env: ['deno', 'module', 'browser', 'production']` (or development).

With [Chomp installed](#chomp-setup), create a new `chompfile.toml`:

chompfile.toml
```toml
version = 0.1

extensions = ['chomp@0.1:jspm']

# Chomp itself uses a local npm version of @jspm/generator
# This will automatically install that for us as necessary
# (saving running a manual npm install)
[template-options.npm]
auto-install = true

[[task]]
target = 'importmap.json'
deps = ['deno-generate.ts']
template = 'jspm'
[task.template-options]
env = ['deno', 'browser', 'module', 'production']
```

For the example generation, create `deno-generate.ts` that runs a simple Lit generation:

deno-generate.ts
```ts
import { Generator } from '@jspm/generator';

const generator = new Generator({
  env: ['browser', 'module', 'production']
});

await generator.install('lit');
console.log(generator.getMap());
```

To build the import map for the generation operation itself, run Chomp for the `importmap.json` target (or we could name this task in the Chompfile with `name = "build"`):

```sh
chomp importmap.json
```

On completion, the full import map for `@jspm/generator` itself will be populated into `importmap.json` by the JSPM Chomp template via a Node.js Chomp task.

With the import map constructed, Deno execution of `@jspm/generator` over the JSPM CDN is now possible with:

```
deno --unstable run -A --no-check --import-map importmap.json deno-generate.ts
```

On completion, the original Lit import map will be displayed, as generated through Deno against JSPM Generator on the JSPM CDN.

Like npm scripts, we can define this Deno execution as a Chomp task itself adding the task to the Chompfile:

```toml
[[task]]
name = 'deno-generate'
deps = ['importmap.json']
run = 'deno --unstable run -A --no-check --import-map importmap.json deno-generate.ts'
```

For an easier `chomp deno-generate` execution that will first ensure the import map is up-to-date in the task graph.
