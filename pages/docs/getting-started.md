+++
title = "JSPM CLI - Getting Started"
description = "JSPM CLI Getting Started"
+++

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


