+++
title = "FAQ"
description = "JSPM FAQ"
prev-section = "docs/integrations"
+++

# FAQ

## What is JSPM?

JSPM is an open source project for working with dependency management via import maps in browsers.

The [jspm.io](/cdn) CDN is the default CDN provider used in the JSPM project for loading optimized dependencies directly from npm without a separate build step.

Other CDN providers can easily be configured, with support for all major providers included by default in the project.

## What are Import Maps?

Import maps are a new specification ...

## What are the Benefits of Import Maps?

Import map CDNs provide a huge caching benefit because we can both treat all URLs as immutable with far-future expires, while still giving each package a unique URL that can be shared even as its dependencies are updated.

This maximises the cache usage of packages - shipping an update of your application doesn't require your users to re-download the entire application build. Their browser caches will maintain the exact dependency versions from the last update, making incremental updates highly performant.

In addition, because the jspm.io CDN has worldwide edge caching, when a user first requests a dependency there's a good chance it is likely already cached at thier local regional edge due to other websites also using the [jspm.io](/cdn) CDN, reducing latency and load time.

## What is Import Map Package Management?

Treating packages as the unit of optimization means that the import map itself becomes the version lock in the browser providing the guarantee that the application will continue to behave the same today as tomorrow since the contract with the module CDN is clear.

The [JSPM CLI](/docs/#cli) provides the package management functions you would expect for managing these import maps.

## How can Import Maps be supported in older browsers?

Import maps are supported in the latest versions of Firefox, Safari and Chrome. To support import maps in older browsers we use [ES Module Shims](https://github.com/guybedford/es-module-shims), a performant polyfill for import maps that can very quickly check the module scripts on the page and replace bare specifier strings (like `import 'pkg'`) with their resolved URLs.

By default, when using JSPM Generator, this polyfill is included by default.

## What is the "exports" field?

## How does JSPM use the "exports" field?

## What is the difference between JSPM and jspm.io?

## Can jspm.io be used for production apps?

## How is jspm.io funded?

## Can I host my own modules CDN?
