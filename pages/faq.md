+++
title = "FAQ"
description = "JSPM FAQ"
prev-section = "getting-started"
next-section = "/docs/jspm"
next-section-title = "JSPM CLI"
+++

# FAQ

## What is JSPM?

JSPM is an open source project for working with dependency management via import maps in browsers.

The [jspm.io](/cdn/jspm-io) CDN is the default CDN provider used in the JSPM project for loading optimized dependencies directly from npm without a separate build step.

Other CDN providers can easily be configured, with support for all major providers included by default in the project.

## What are the Benefits of Import Maps?

Import map CDNs provide a huge caching benefit because we can both treat all URLs as immutable with far-future expires, while still giving each package a unique URL that can be shared even as its dependencies are updated.

This maximises the cache usage of packages - shipping an update of your application doesn't require your users to re-download the entire application build. Their browser caches will maintain the exact dependency versions from the last update, making incremental updates highly performant.

In addition, because the jspm.io CDN has worldwide edge caching, when a user first requests a dependency there's a good chance it is likely already cached at thier local regional edge due to other websites also using the [jspm.io](/cdn) CDN, reducing latency and load time.

## Where are Import Maps Supported?

Import maps are supported in the latest versions of Firefox, Safari and Chrome. They are also supported in Deno.

To support import maps in older browsers there is the [ES Module Shims](https://github.com/guybedford/es-module-shims) import maps polyfill, a small performant polyfill for import maps that can very quickly check the module scripts on the page and replace bare specifier strings (like `import 'pkg'`) with their resolved URLs, suitable for production workflows.

When using JSPM Generator, this polyfill is included by default. For background on ES Module Shims, see the blog post [How ES Module Shims became a Production Import Maps Polyfill](https://guybedford.com/es-module-shims-production-import-maps).

## What is Import Map Package Management?

Treating packages that have their own versioning as the unit of optimization means that the import map itself becomes the version lock in the browser providing the guarantee that the application will continue to behave the same today as tomorrow since the contract with the module CDN is clear.

The [JSPM CLI](/docs/jspm) provides the package management functions you would expect for managing these import maps.

## Is JSPM Standards-Compatible?

JSPM is built entirely around the [standards for modules in browsers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), the [import maps standard](https://github.com/WICG/import-maps) and the [Node.js module resolution specification](https://nodejs.org/dist/latest-v19.x/docs/api/esm.html#resolver-algorithm-specification).

JSPM then extends the Node.js module resolution algorithm in a backwards-compatible way to [CDN module resolution](/docs/cdn-resolution).

## What is the difference between JSPM and jspm.io?

JSPM is the open source project suite of tools for working with import maps and import map package management.

[jspm.io](/cdn/jspm-io) is the hosted module CDN serving all of npm with CommonJS to ES module conversion and individual package optimization and minification to be compatible with JSPM import maps.

## What is jspm.dev?

[jspm.dev](/cdn/jspm-dev) is a convenience development-only CDN for quickly using packages in the browser without any other steps being necessary, without even needing an import map. Because there is no version lock, which is what import maps provide, it should never be used for production.

## Can jspm.io be used for production apps?

jspm.io is designed as a highly available production modules CDN, with 99.99% availability, and has been serving modules for over 10 years. Status can be tracked at https://status.jspm.io/.

See the [production workflow](/getting-started#production-workflow) in the getting started guide for how to use jspm.io in production.

## Can I use other modules CDNs with JSPM?

Yes, JSPM is designed to support any CDN providers, see the [provider switching workflows](/getting-started#providers) in the getting started guide.

PRs for new providers are always welcome to the [JSPM Generator core](https://github.com/jspm/generator) project.

Custom providers can also be defined.

## How is jspm.io funded?

jspm.io is funded through the JSPM Foundation, a member-run Canadian not for profit corporation, which has a long-term financial plan in place for continuing to support the project.

Donations and sponsorships are used to fund the server costs.

* Open Collective - https://opencollective.com/jspm
* GitHub Sponsors - https://github.com/sponsors/jspm

New sponsors and donations are always very much welcome to ensure long-term sustainability.

[CacheFly](https://www.cachefly.com/) is the CDN infrastructure sponsor for the project.
