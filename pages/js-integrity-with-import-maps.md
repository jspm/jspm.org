+++
title = "Integrity Manifests with Import Maps"
description = "Using the new 'integrity' feature for import maps provides a new integrity manifest security model for JS modules on the web"
prev-section = "jspm-dev-deprecation"
+++

# JavaScript Integrity with Import Maps

<p style="text-align: right; margin-top: -4em; margin-bottom: 4em; font-size: 0.9em;"><em>Guy Bedford, July 28<sup style="padding-left:0.15em">th</sup> 2024</em></p>

Until recently, there were only two ways to define [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) for JavaScript code on the web:

1. With the integrity directly on the script tag: `<script type="module" integrity="sha386-..." src="...">`.
2. With the integrity directly on a preload tag: `<link rel="modulepreload" integrity="sha386-..." href="...">`.

These requirements for integrity come with some limitations:

* Integrity does not apply for ES mdoule imports, since there is [no `"integrity"` attribute planned](https://github.com/tc39/proposal-import-attributes?tab=readme-ov-file#why-not-out-of-band) for something like `import 'dep' with { "integrity": "..." }`.
* There is no standard way to apply dynamic integrity injection for lazily loaded dynamic `import()`s. All JS source with integrity must be eagerly fetched and loaded by the network with a direct script or preload tag.
* Since a given JS module may be imported in multiple places, every single call site is responsible for ensuring the integrity check, making it hard to treat this as a security guarantee.

The above often make it inhibitatively difficult to ship ES modules on the web with full integrity for JS resources, or to even consider a `Content-Security-Policy: require-sri-for script;` integrity policy when shipping ES modules.

With the new `"integrity"` field for import maps, [recently released in Chrome 127](https://developer.chrome.com/release-notes/127#importmap_integrity), we now have a new security primitive for JS modules on the web with the ability to define a full integrity manifest without the above concerns.

### The Import Map `"integrity"` field

The [import map "integrity"](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap#integrity_metadata_map) field in import maps allows populating a mapping of URLs to their integrity attributes.

These integrity values are then applied for all JS imports matching the defined URLs, applying both to modules loaded statically on page initialization along with their dependencies, and those lazily loaded after the initial page load.

Having all the module integrity in this new single manifest makes it much easier to verify and update integrity across an application, as well as to support `require-sri-for`.

### Example

To take advantage of this new field when using JSPM, the JSPM Generator and CLI now support a new `integrity` option and flag.

For example, consider the following HTML application `app.html`:

```html
<!doctype html>
<script type="importmap">
{
  "imports": {
    "lit": "https://cdn.jsdelivr.net/gh/lit/dist@3.1.4/core/lit-core.min.js"
  }
}
</script>
<script type="module" src="./app.js"></script>
<body>
  <simple-greeting name="World"></simple-greeting>
</body>
```

where `app.js` contains:

```js
import {html, css, LitElement} from 'lit';

class SimpleGreeting extends LitElement {
  static styles = css`p { color: blue }`;
  static properties = {
    name: {type: String}
  };
  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}
customElements.define('simple-greeting', SimpleGreeting);
```

We can use the JSPM CLI to update this HTML page to relink the modules, outputting the new import map back into the same HTML page:

```bash
jspm link app.html --integrity -o app.html
```

This will update `app.html` to now contain:

```html
<!doctype html>
<script type="importmap">
{
  "imports": {
    "lit": "https://cdn.jsdelivr.net/gh/lit/dist@3.1.4/core/lit-core.min.js"
  },
  "integrity": {
    "./app.js": "sha384-JBeRlySsOPUakm9Jdnn7Kcmbf/FFAGhbcEcwJkBXYCdtAtG1oVv5/PVycS1nsNKC",
    "https://cdn.jsdelivr.net/gh/lit/dist@3.1.4/core/lit-core.min.js": "sha384-1XCsIc9Rfy/YoXO1AeA7koK9Donixq1VQYObT7umyw25v2v8dBBumjdE8cgOg4aW"
  }
}
</script>
<script type="module" src="./app.js"></script>
<body>
  <simple-greeting name="World"></simple-greeting>
</body>
```

With the above `"integrity"` configuration, we don't need to consider any further integrity attributes at all for a top-level `<script type="module" src="">` site, instead the integrity will always be verified for all of the modules imported.

If the network returns a different source for a given JS file, then a network error is thrown, instead of there being a potential vulnerability.

> Try it out on the [online generator](https://generator.jspm.io) here turning on the `Integrity` toggle at the top of the page to see an example of the generated import map integrity field.

### ES Module Shims Support

The es-module-shims polyfill project now fully includes a [polyfill for import map `"integrity"`](https://github.com/guybedford/es-module-shims?tab=readme-ov-file#import-map-integrity).

Whenever the polyfill is engaging (either in shim mode, or when statically unsupported modules features are used), `"integrity"` metadata will be passed to the underlying `fetch` request used by the polyfill, to ensure that even when the polyfill is engaging integrity is still supported.

While not a comprehensive security model (unless using shim mode), the ability to support `"integrity"` when the polyfill is engaging still expands the coverage of the integrity checks for users of an application, still raising the overall level of security.

### A Future with Integrity

Integrity should be the default for all JS applications, especially those relying on third-party CDNs.

This can then prevent the fallout of attacks like the recent [polyfill.io supply chain attack](https://cside.dev/blog/more-than-100k-websites-targeted-in-web-supply-chain-attack), where users relying on the `polyfill.io` CDN to serve JS code found that code being tampered with to create targeted redirects across all sites embedding these JS polyfills.

To get there, providing integrity must become a first-class part of our JS deployment workflows, which the new `"integrity"` field can help enable.

<br />
