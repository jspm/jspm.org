+++
title = "JSPM CLI - Getting Started"
description = "JSPM CLI Getting Started"
prev-section = "overview"
next-section = "docs/index"
+++

## JSPM Generator

The best way to try out the `jspm.io` CDN is by using the JSPM import map generator, either using the online version at [https://generator.jspm.io](https://generator.jspm.io) or programatically through the [API](https://github.com/jspm/generator).

The generator takes as input a the package target versions, their subpaths and output options and returns the complete import map against the `jspm.io` CDN.

The resultant import map can be directly included in any HTML page where local modules can then import the mapped dependencies by name.

_This import map is all that is needed to work with dependencies in native modules workflows in browsers, allowing you to get back to focusing on just running your own code natively in the browser, instead of needing to configure complex build tools and package management systems._

> Try out one of the [example workflows](/docs/workflows) for a full example.

The formats supported for adding a dependency in the generator "add dependency" box are:

* react
* lit-element@2
* lodash/sort

Individual package exports are installed separately as they are separate entries in the import map.

Once a dependency has been added, the UI allows changing the dependency version or adding or removing [package exports](#exports-field) from the import map. By default if no subpath is added initially, only the main entry point for the package will be added to the import map. Each line of the import map `"imports"` section corresponds to a single dependency version and exports subpath in the dependencies bar.

The bottom left of the sidebar allows configuring the [conditional exports](#conditional-exports) environment resolution from the environment panel, allowing for choosing e.g. the production or development variants of packages.

The import map generated can be downloaded or copied directly into an HTML application.

By default the [import maps polyfill](/docs/workflows#import-maps-polyfill) is embedded in the provided source HTML as well. Alternatively a [SystemJS Import Map](/docs/workflows#systemjs) can be generated instead to support older browsers even without any native modules support.


# Getting Started

In this guide we are going to create a simple app, and then use the JSPM CLI to generate an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) for it, allowing us to run it in the browser. Import maps are a standard that solve the problem of _bare specifier imports_ for ES modules. Prior to their adoption, `import` statements in ES modules were required to specify fully qualified or relative URLs:

```js
import { foo } from 'https://www.example.com/foo.js';
import { bar } from './bar.js';
```

This is problematic for a number of reasons we won't go into here, but suffice to say it's not very ergonomic and reduces the cacheability of ES modules. An import map looks like this:

```json
{
  "imports": {
    "react": "https://ga.jspm.io/npm:react@18.2.0/dev.index.js"
  }
}
```

Once you've loaded an import map like this into your runtime (via a `<script type="importmap">` tag in the browser, for instance), you can start to use bare specifier imports in your ES modules, just like you would in other JavaScript module systems like CommonJS:

```js
import * as react from 'react';
```

The JSPM CLI is essentially a tool for managing and generating import maps, so you don't have to worry about looking up packages on a CDN, upgrading things, or working out the full transitive dependency tree of your application by hand. It's all done for you!

To begin with, you will need to install the JSPM CLI:

```bash
npm install -g @jspm/jspm
```

## Setting up the App

## Local Workflows with JSPM

## Switching to a CDN


