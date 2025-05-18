+++
title = "Import Map Services"
description = "Discussing development and trust models for import map services"
+++

# Import Map<br/>Services

<p style="text-align: right; margin-top: -4em; margin-bottom: 4em; font-size: 0.9em;"><em>Guy Bedford, October 14<sup style="padding-left:0.15em">th</sup> 2024</em></p>

Import maps have been a stable feature across browsers since 2023. In that time we've seen adoption in major frameworks including Rails and Sympony. While many development teams have been coming up with management strategies for them, currently just about all those strategies use inline `"importmap"` script tags with the JSON inlined into the HTML on the page in which they are used.

We believe import map URLs will become a major model for browser module management in future, and further more that they will no longer be treated as opaque hosted assets, but rather that these maps will be managed solutions we call "import map services". Effectively, these are systems which are aware of the nature of the import map and integrate import map module management strategies with the wider development, deployment and security processes of the host.

### Providing Import Map URLs

In the original import maps specification it supported the feature of "import map URLs", which allow defining import maps from a URL like the following:

```html
<script type="importmap" src="https://site.com/importmap.json"></script>
<script type="module">import 'app'</script>
```

This was removed when merging into HTML (due to a combination of a lack of implementer resources as well as a need further further discussion and feedback around the performance and blocking behaviours).

Even without support for this feature it is possible today to support hosted import maps via the following:

```html
<script src="https://host.com/import-map.js"></script>
```

Where the `import-map.js` script makes use of the old `document.write` toolbox:

```js
document.write(`<script type="importmap">${JSON.stringify({
  "imports": {
    "app": "/app.js",
    "lib": "/lib/index.js"
  },
  "scopes": {
    "/lib/": {
      "dep": "/dep/index.js"
    }
  }
})}</script>`);
```

The above works in all browsers today, effectively supporting the ability to offer import maps from arbitrary URLs, and hence import map services.

Assuming good caching rules, it should be possible to only pay the blocking fetch cost on first load, but then use a locally cached map without a performance cost for subsequent page loads within the web application.

### Properties of Import Map Services

Import map services can provide streamlined features for common development scenarios. For example, being able to test & gradually roll out a security update to a dependency in the map or providing targetted import maps, based on client data, varying the application code based on the user.

Where these features are normally integrated into the HTML rendering framework and bundler, import map services would operate at a level of abstraction separated from the underlying framework, allowing a clearer separation of application code and import tooling.

And since they operate at the runtime layer they represent a live source of truth for visibility into the usually opaque world of a JS deployments.

### Module CDNs & Trust Models

`jspm.io` offers a module CDN against which production-level import maps can be supported. It's been adopted by frameworks such as Rails and is used internally in Framer Sites for instant in-browser code loading.

JSPM takes the position that it is possible to offer a trustless module CDN, provided the following properties:

1. URLs are fully static and permanent, so that they can be cached and loaded with integrity.
2. It is possible to verify the build process that generated those module URLs.
3. Module conventions are well-defined enough to easily allow re-hosting / switching of providers.

Since import maps are soon to support the new `"integrity"` field (see [JavaScript Integrity Manifests with Import Maps](/js-integrity-with-import-maps)), when given the first two properties, they can form a trustless representation of the JS application that cannot be tampered with at runtime.

The only remaining question about the module CDN provider like `jspm.io` provides are the well-known questions of user data management, privacy (we don't set tracking cookies) and the ability for a provider to block / censor.

For these cases, we believe having an ecosystem of module CDN providers is the way forward to ensure it is always possible to easily switch providers in the event of a breach of the above trust, and this is why the JSPM Generator supports choosing any provider when generating import maps, aiming to participate to improve (3) above.

### Import Map Trust Models

Provided integrity is used and that it is possible to easily switch providers, the import map then, is the primary root of trust to consider - how it is generated and from where it is served, not really so much the module or asset CDN.

By allowing users the tools to better manage their own import maps and also by offering tools to vet import maps, we hope that import map services can provide more visibility and not less - that security is top-of-mind enough at this point that such systems will be designed with these properties from the core to ensure that map generation follows a consistent security model.

The other root trust is module registries themselves. All of us trusting Microsoft running npm is of course always assumed at this point, but the trust chain should still be a direct verifiable process from registry to module CDN, allowing trustless module CDNs, alongside the trust placed in registries and import map services.

### jspm.io and the JSPM Foundation

The role of the JSPM Foundation is in maintaining this aiming to be trustless in future infrastructure for `jspm.io`, based on the sponsorships we receive (thanks to our sponsors, we're just managing to stay cashflow neutral), while contributing to the JSPM OSS tooling that can allow treating module CDNs as changeable providers with tools like the [JSPM CLI](https://jspm.org/docs/jspm-cli/stable/) and [JSPM generator](https://jspm.org/docs/generator/stable/) to help build out the conventions in this space.

The JSPM project still has a long way to go - we only recently adopted integrity, and still need to support verifiability. But as long as we stay true to the principles outlined here, it should be possible to find the right balance of trust models for the future of code execution on the web.

And finally, for my colleagues working in this space, I hope that these ideas can resonate with you, and that we can aim to assume clear conventions and trust modules with verifiability and integrity as given table stakes, as we continue to build out these new systems and tools for native modules.
