+++
title = "JSPM CLI Relaunch - Import Map Package Management"
description = "Relaunching the JSPM CLI as an Import Map Package Manager"
+++

# JSPM CLI Relaunch

<p style="text-align: right; margin-top: -4em; margin-bottom: 4em; font-size: 0.9em;"><em>Guy Bedford, April 4<sup style="padding-left:0.15em">th</sup> 2023</em></p>

Last week Apple landed support for import maps in Safari 16.4, resulting in [all major web browsers](https://caniuse.com/import-maps) now supporting the [import maps standard](https://github.com/WICG/import-maps).

_Today, the JSPM CLI is being relaunched as an import map package management tool._

## Import Map Package Management

```
npm install -g jspm
```

The thesis of JSPM has always been that browser map management is package management. It's a great milestone to finally be able to re-release the CLI for exactly this on top of entirely native standards.

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
<p style="text-align: center"><em>The import map for <code>lit</code></em></p>

Creating an import map for `lit` can be achieved with JSPM with just the following CLI command:

```
jspm install -m app.html lit --env=production
```

JSPM respects `package.json` version ranges and supports all the features of Node.js module resolution in a browser compatible way. It works with most module CDN providers e.g. by just adding `--provider unpkg` to the install command.

The new [getting started guide](/getting-started) and documentation covers all the details and workflows around the use cases here, including generating maps [against node_modules](http://localhost:8080/getting-started#the-nodemodules-provider) directly (just without the CJS -> ESM conversion and optimization of the [jspm.io CDN](/cdn/jspm-io)), handling [production workflows with preload injection](http://localhost:8080/getting-started#production-workflow) and using JSPM for [import map package management in Deno](http://localhost:8080/getting-started#deno-workflows).

I must admit it's pretty relieving that only for the first time ever, JSPM is largely feature complete!

## CacheFly Sponsorship

<a href="https://www.cachefly.com/"><img src="cachefly.png" style="width: 10em; float: left; margin-right: 1em; margin-bottom: 1em;" /></a>

The `jspm.io` CDN is now running on the CacheFly CDN, thanks to their generous infrastructure sponsorship. With over 900m requests being served per month, the migration to their CDN service was seamless and has reduced our infrastructure costs significantly.

And thanks to our amazing project sponsors [37 Signals](https://37signals.com), [Socket](https://socket.dev), [Framer](https://framer.com) and [Scrimba](https://scrimba.com) for sustaining the project financially.

<br />
