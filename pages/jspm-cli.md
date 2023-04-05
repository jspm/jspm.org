+++
title = "JSPM CLI Relaunch - Import Map Package Management"
description = "Relaunching the JSPM CLI as an Import Map Package Manager"
+++

# JSPM CLI Relaunch

<p style="text-align: right; margin-top: -4em; margin-bottom: 4em; font-size: 0.9em;"><em>Guy Bedford, April 5<sup style="padding-left:0.15em">th</sup> 2023</em></p>

Last week Apple landed support for import maps in Safari 16.4, resulting in [all major web browsers](https://caniuse.com/import-maps) now supporting the [import maps standard](https://github.com/WICG/import-maps).

Today, the JSPM CLI is being relaunched as an import map package management tool.

## Import Map Package Management

**The thesis of JSPM has always been that browser import map management is package management.**

Creating and managing an import map should be like using a traditional package manager:

```
jspm install -m app.html lit --env=production
```

```html
<!doctype html>
<script type="importmap">
{
  "imports": {
    "lit": "https://ga.jspm.io/npm:lit@2.7.0/index.js"
  },
  "scopes": {
    "https://ga.jspm.io/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@1.6.1/reactive-element.js",
      "lit-element/lit-element.js": "https://ga.jspm.io/npm:lit-element@3.3.0/lit-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@2.7.0/lit-html.js",
      "lit-html/is-server.js": "https://ga.jspm.io/npm:lit-html@2.7.0/is-server.js"
    }
  }
}
</script>
<script type="module">
import * as lit from 'lit';
console.log(lit);
</script>
```
<p style="text-align: center"><em>The JSPM-generated import map for <code>lit</code></em></p>

JSPM respects `package.json` version ranges and supports all the features of Node.js module resolution in a browser compatible way. It supports arbitrary module URLs and CDN providers e.g. by just adding `--provider unpkg` to the install command (or even local `node_modules` mappings via `--provider nodemodules`).

Better apps are written when there are less steps between the developer and their tools, less steps between development and production, and less steps between applications and end-users.

## Package-Aligned Caching

JSPM's default CDN, `jspm.io` serves unique versioned package URLs with packages individually optimized using the standard [code splitting optimization](http://localhost:8080/cdn/jspm-io#package-optimization) technique against their enumerated public entry points (package `"exports"`).

Aligning caching with package URLs in this way provides a number of major benefits - primarily that regardless of the exact code being loaded, the cache storage is the same. Usually bundlers produce bundles that are very unique to the build system, while with JSPM a single optimized dependency maintains a singular representation (for a given provider).

As a result, navigating between pages of a large web application dependency, package network caches are always fully shared naturally without complex build tool rules to maintain this. The cache either has a unique versioned package path or not. Upgrades to a web app that only change one package don't need to invalidate every other package that has been downloaded.

These caching benefits even extend to regional edge caching; edge-cached dependencies can be shared between different web applications using the same CDN edge nodes.

Finally, URLs are also easily human readable, maintaining the all-important _view source_ property of the web.

## Updated Documentation

The reworked [Getting Started](/getting-started) guide, [FAQ](/faq) and [documentation](/docs/jspm) now reflect the latest updates with the techniques and workflows simplified for the current progress in native modules standards.

## Announcing our Infrastructure Sponsor: CacheFly

<a href="https://www.cachefly.com/"><img src="cachefly.png" style="width: 10em; float: left; margin-right: 1em; margin-bottom: 1em;" /></a>

The `jspm.io` CDN is now running on the CacheFly CDN, thanks to their generous infrastructure sponsorship. With over 900m requests being served per month, the migration to their CDN service was seamless and has reduced our infrastructure costs significantly.

Finally a huge thanks to the project sponsors [37 Signals](https://37signals.com), [Socket](https://socket.dev), [Framer](https://framer.com) and [Scrimba](https://scrimba.com) for sustaining the project.

<br />
