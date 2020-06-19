# jspm.dev Release

<p style="text-align: right; margin-top: -4em; margin-bottom: 4em; font-size: 0.9em;">June <em>19<sup>th</sup> 2020&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</em></p>

The latest version of the jspm CDN, `https://jspm.dev` has been launched today as the new replacement for `https://dev.jspm.io`.

_`jspm.dev` allows directly importing any package from npm into the browser using only native ECMAScript module import semantics like `import('https://jspm.dev/pkgname')`._

As of today, `dev.jspm.io` serves 6 million requests to over 150,000 users each month. With the [rise of module CDNs](#modular-javascript-cdns), continued development and performance work are needed to ensure the scalability requirements of fast and highly reliable module delivery.

This new release aligns with full support for the Node.js ECMAScript modules implementation (including the new ["exports" field](#exports-field)) as well as deep [optimization improvements with RollupJS code splitting](#package-optimization) and improved CommonJS compatibility, while [precomputing all of npm](#building-all-of-npm) to ensure zero compile waiting times even when requesting new packages.

`dev.jspm.io` will still be available for a further 12 months until June 2021. Upgrading to `jspm.dev` should be a seamless upgrade path in most cases, with the main user-facing compatibility change being that not all internal subpaths are exposed due to the [code splitting optimizations](#package-optimization).

With today's release the jspm package management CLI is being [fully sunsetted](#sunsetting-the-cli), which after many years of development unfortunately did not manage to meet its development goals as a viable universal package management alternative to npm.

## Modular JavaScript CDNs

The transition of JavaScript CDNs into fully modular ECMAScript module CDNs is now well underway. Existing CDNs such as `jsdelivr.net` and `unpkg.com` now regularly serve ES modules, and continue to innovate in improving their modular semantics, while new module-dedicated CDNs like `cdn.pika.dev` have joined jspm in directly exploring how a complete embrace of modular semantics can provide better library delivery mechnanisms for the web.

The jspm CDN retains its same goals - to allow loading any package from npm optimized as an ECMAScript module, while supporting full dependency sharing. Under this simple statement hides a huge amount of complexity - from optimization and CommonJS compatibility to module interop semantics.

## Package Optimization

Packages served from `jspm.dev` are highly optimized for delivery. To optimize an ES module CDN requires optimizing for three main things:

1. **Minimal response times:** CDN response times are minimized by having an edge CDN with unqiue version URLs for packages to enable far-future expires. This way the browser cache can be used whenever possible, avoiding any request at all. The remaining slow cases are (a) Loading non-exact version URLs like `//jspm.dev/pkg` and `//jspm.dev/pkg@1` and (b) loading a package that has never been loaded before. We handle (a) by using a push-based over a pull-based versioning architecture internally (watching the npm feed instead of querying it), and we handle (b) by [precomputing all of npm](#building-all-of-npm) to ensure every package request takes the same constant time.
2. **Minimal number of modules and code size:** RollupJS code splitting is used to [optimize every package on jspm.dev](#package-optimization). This way a package with a single entry point will always be only a single file, while a package with multiple separate entry points will have carefully constructed shared chunks while avoiding code duplication. In addition all modules are optimized with level 9 Brotli compression, a fully supported compression algorithm across all browsers supporting ES modules.
3. **Minimal dependency latency waterfall:** The dependency latency waterfall occurs when importing a JavaScript module that depends on another module. The import to the second module is only seen once the first has already been loaded, so that each successive deep import requires waiting for a full latency-bound request response cycle. Because there is no limit to how deep a module tree can be, even with 20ms of latency this wait time can add up if left unchecked. All modules served on jspm.dev will expose all known deep dependencies from the first modular response to ensure the latency waterfall is always avoided where possible.

## Building all of npm

jspm.dev achieves instant response times for all requests because the entire compute job for npm has been completed on Google Cloud - every version of every package on npm has been built and optimized and stored for serving through Google Cloud CDN.

When requesting a package that has never requested on `https://jspm.dev` the server does not need to build or optimize it, because it has already been built. New packages are built the moment they are published to npm.

Bug fixes and updates get applied to segments of the CDN over time, for example packages exposing modules or using the "exports" field will be regularly updated. Use the package.json ["exports" field](#exports-field) in your published packages to ensure you get the best support on jspm.dev.

## Package Optimization

The recommended best-practice for packages to serve minimal JavaScript is to have users import subpaths for specific features - `import('pkg/featureA')` and `import('pkg/featureB')`. This way users only download the JavaScript they need for a specific feature.

All packages on `jspm.dev` are optimized with RollupJS. If the package only has a single main entry point it will be delivered as a single file. If the package has multiple entry points then a RollupJS code splitting build is done for those entry points.

For example a package with two files `index.js` and `feature.js`, where `index.js` imports from `feature.js`, can be optimized with RollupJS to be served as a single file by inlining the contents of `feature.js` into `index.js`.

For the multiple entry point case, if the package expects consumers of the package to be able to import `pkg/feature.js`, then we use a code splitting build to build both `index.js` and `feature.js` as separate entry points, while perfoming the original inlining optimization to any other files which are not consumed by users.

## Subpath Detection

The major problem with separate entry points for npm packages is that when running the RollupJS code splitting optimizations, it isn't known which modules of the package are supposed to be available for import by the consumers of the package, and which are purely there for the private internal implementation.

On `jspm.dev` this is handled by a statistical approach that uses an analysis of every npm package module to determine how they are imported by other packages on npm. This is then used to determine which modules are consumer-facing and which can be inlined internally with the RollupJS code splitting build.

Being a statistical method, this approach isn't perfect, but it works very well. Even packages with many hundreds of entry points like Lodash, RxJS, CoreJS and Ramda work out correctly under this optimization while still getting the benefits of code splitting.

## Exports Field

_The preferred way of defining package subpaths is with the `"exports"` field, which when set, removes the need for any subpath detection analysis. The exports field directly informs and encapsulates the full list of public subpaths that the package provides._

The [Node.js package "exports" field](https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_package_entry_points) is a way for packages to clearly define their public interface.

For example, a package with a package.json file containing:

```json
{
  "exports": {
    ".": "./main.js",
    "./feature": "./feature.js"
  }
}
```

will be optimized in RollupJS for `main.js` and `feature.js` as two separate entry points. jspm.dev will then support `import('//jspm.dev/pkg')` as well as `import('//jspm.dev/pkg/feature')` as fully optimized requests.

Exports also permit environment-based conditional resolutions for having different resolutions between e.g. Node.js and browsers (or even `"deno"`), making the `"exports"` field a modern replacement for the Browserify `"browser"` field.

Read the Node.js documentation or [jspm.dev documentation](/#exports-field) for further guidance on using this field in published packages.

## Sunsetting the CLI

It is a bittersweet announcement today in that the jspm package management CLI was formerly the primary way to use the project, but times have changed much since its initial announcement in 2014 (back when its primary competitor was Bower!).

The original goal was for jspm CLI to provide an alternative to npm to support both Node.js and browser module semantics as a universal package manager, but the reality is that most users find npm complex enough without adding these further browser constraints and difficulties in ensuring modules include explicit file extensions and work universally etc.

It was a really hard decision to drop many years of work, but after two unfinished major releases it's important to look forward to where modules are going today.

With Deno supporting URL-based resolution and users now aware of concepts like on-demand package management, the idea of CDN-based package delivery is far more embraced today. With the jspm CDN as the focus, development resources will be freed up from other work to ensure the best possible experience here.

Providing a modular CDN engages deeply with concepts of security and privacy to ensure the health of the ecosystem as such a tooling base is adopted, and continuing to actively work on these problems remains a primary objective for the project.

## Open Collective

Today we are also also starting [a new Open Collective](https://opencollective.com/jspm) for allowing sponsorship of jspm development and server costs. With the new CDN, now maintained alongside previous versions, server costs are not insignificant. If you'd like to support the project, please do consider [donating to the Open Collective](https://opencollective.com/jspm).

## Next Steps

There are still plenty of new developments around browser modules and module delivery with many problems still to work out, from performance and development practicalities to integrity, trust and privacy; continuing to be involved in these discussions, specifications and developments remains a priority for the project. Watch out for further updates over the coming months!

A huge thank you, as always, to all users and supporters of the project for their feedback, appreciation and patience in the development process.
