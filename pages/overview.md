+++
title = "Overview"
description = "Overview of the JSPM project"
next-section = "getting-started"
+++

# Overview

### Import Maps Caching Benefits

Import map CDNs have a huge caching benefit because we can both treat all URLs as immutable with far-future expires, while still giving each package a unique URL that can be shared even as its dependencies are updated.

This maximises the cache usage of packages - shipping an update of your application doesn't require your users to re-download the entire application build. Their browser caches will maintain the exact dependency versions from the last update, making incremental updates highly performant. It's like the difference between running `npm update react` and a full `npm install` from fresh.

Treating packages as the unit of optimization also means that the import map itself becomes the version lock in the browser providing the guarantee that the application will continue to behave the same today as tomorrow since the contract with the module CDN is clear.

For support in older browsers there are two options provided - firstly by default, [ES Module Shims](https://github.com/guybedford/es-module-shims) is included, a fast Wasm-based [polyfill for import maps](#import-maps-polyfill) that works on top of basic native modules support supported in the majority of browsers.

### Import Maps Polyfill

Import maps are supported in the latest versions of Firefox, Safari and Chrome. To support import maps in older browsers we use [ES Module Shims](https://github.com/guybedford/es-module-shims), a performant polyfill for import maps that can very quickly check the module scripts on the page and replace bare specifier strings (like `import 'pkg'`) with their resolved URLs.

By default, when using JSPM Generator, this polyfill is included by default.