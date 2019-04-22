## Why is this both a package manager and a build tool?

## How does jspm provide compatibility with CommonJS?

## Why jspm_packages and not node_modules?

# What's with the CDN? Can we deliver modules unbuilt with HTTP/2?

# Architecture

The first version was based on SystemJS as the spec for JS execution, which became stalled when that spec was no longer supported.

This version aims to realign with:

* `<script type="module">` and dynamic `import()`
* NodeJS support for ES modules (must remain compatible with however Node adopts ES modules).
* Building all CommonJS modules into ES modules _on install_ for native browser modules support.
* Package name maps in browsers using the [ES Module Shims](https://github.com/guybedford/es-module-shims) project to get these to work in all modular browsers today.
* Using SystemJS as the "legacy workflow" for browsers without modules support

The benefit of this approach is that the model becomes very simple:

**jspm installs only ES modules, and then you just need to use the jspm resolver to work with them.**

Since loading only requires the jspm resolver, it is easy to provide into existing build tools by just writing a wrapper plugin. Node.js and browser support similarly are simply resolver-level (Node.js through a custom module loader resolve hook and the browser through import maps).

These workflows above will all make further sense in how they come together going through this guide.