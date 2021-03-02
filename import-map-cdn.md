# Import Maps &<br/> Module CDNs

<p style="text-align: right; margin-top: -4em; margin-bottom: 4em; font-size: 0.9em;">March <em>2<sup>nd</sup> 2021&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</em></p>

_Today Chrome 89 ships as stable with support for [package import maps](https://github.com/wicg/import-maps) in browsers. Aligning with this support, JSPM.IO is being relaunched today as a native modules import map CDN, along with an [online import map generator](https://generator.jspm.io) for creating import maps against the module CDN._

## Import Maps Explainer

Import maps allow defining the locations of modules imported from JavaScript in the browser, effectively like you would expect in any other language (and as is already supported in Node.js):

```html
<script type="module">
  import pkg from 'pkg';
</script>
```

Before import maps, if you run the above in any browser you would get the following error:

`'Uncaught TypeError: Failed to resolve module specifier "pkg". Relative references must start with either "/", "./", or "../".'`

This is because unlike other web resources, the JS modules specification for HTML reserved the space of these non-relative references (called "bare specifiers") exactly to allow custom package imports via import maps.

To map this specifier with an import map, we add the new `"importmap"` script type to the web page:

```html
<script type="importmap">
{
  "imports": {
    "pkg": "./pkg/main.js"
  }
}
</script>
```

And as of today, the above workflow is supported natively in Chromium for the first time.

In addition to the `"imports"` field in the import map, there is also the [`"scopes"` field](https://github.com/wicg/import-maps#scoping-examples) which allows for scoping the import mapping (useful when there are naming / version conflicts). Import maps can even map entire resolved URLs which can be useful in mocking workflows.

## The JavaScript Module Caching Tradeoff

Import maps may seem nice and all, but perhaps they don't seem like much of a big deal - do they really solve any production-time technical problems?

The answer is that they do actually do solve quite a deep performance problem with JS modules in browsers!

Without import maps, there is a natural caching tradeoff that applies to shipping JS modules in production, something like the following:

* On the web you usually want all URLs to be unique and cached with far-future expires (the fastest request being no request).
* We usually achieve this with unique URL schemes by including hashes or a unique build identifier in URLs so that updates don't cause conflicts.
* Since modules have to import eachother by name `app-a09s8df0.js` will end up containing `import './dependency-s8df79sd.js'`, and as a result the top-level
  hash is dependent on the lower-level hashes. A change to a deep dependency changes the `import './dependency-s8df79sd.js'` into a `import './dependency-qw97g23s.js`, which in turn changes the hash of `app` itself. That is, a deep dependency change invalidates all the parent modules. A small change causes a large invalidation.
* SO if we want to be able to have cache sharing of parent modules while invalidating dependencies, we may be better off having `app.js` load `dependency.js` and then just not using far future expires.

There is thus a complex tradeoff to be made between perfect caching that quickly invalidates with updates, and imperfect caching that might provide better cache sharing for updates.

In comparison to build techniques today the above might not sound so bad, but we shouldn't compare to what we do today - we should compare to the theoretical best case.

## Ideal Modular Caching

The theoretical ideal for module caching would be for each module to be cached with far future expires, while only being invalidated when that module itself changes.

Import maps can provide us with exactly this property:

```html
<script type="importmap">
{
  "imports": {
    "app": "./dist/app-cvf98b7c.js"
    "dependency": "./dist/dependency-s9df7987.js"   
  }
}
</script>
<script type="module">import 'app'</script>
```

Where `app.js` would contain:

```js
import 'dependency';
```

We now have the ability to independently update either `app` or `dependency` using the import map, while having both modules cached with far-future expires.

**Import maps bring the possibility of perfect caching for incremental updates of applications on the web.**

It turns out that coupled with using dynamic `import()` lazy loading for first-load optimization, JS modules can be a pretty good bet for production workflow performance.

## Module CDNs

Module CDNs take the perfect caching concept and extend it based on the following principle - taking the JS package as both the unit of optimization and the unit of perfect caching.

For a given package and version of that package, we optimize the entire package unit as a whole and host it under a unique URL with the version number.

Import maps applied to this model then allow perfect caching at the level of per-package granularity. The benefit of this being that the optimized package files can be shared
between any number of applications since packages are exactly the granularity of usage, it acts as a source of precompiled JS packages for the browser.

[JSPM.IO now serves this role](/docs/cdn), with import maps generated by the [Online Import Map Generator](https://generator.jspm.io).

This effectively then provides something akin to the npm install workflow that can work natively for browsers, with the import map treated as a sort of lockfile. JSPM as a browser native package manager exactly stems from this principle.

## Support in Other Browsers

While we wait the years it will take for import maps to be widely supported, for browsers other than Chrome 89 with import maps support, there are two approaches currently available:

1. [ES Module Shims](https://github.com/guybedford/es-module-shims): A fast Wasm-based polyfill that just replaces the specifiers with their full URLs while still using the native loader. It's good enough for production in most cases and is used by the JSPM generator itself.
2. [SystemJS](https://github.com/systemjs/systemjs): A complete version of the entire `jspm.io` CDN is available serving [SystemJS modules](/docs/cdn#systemjs-variant), when selecting the "SystemJS Import Map" option from the JSPM Generator. SystemJS provides a workflow where native module semantics can be replicated in all browsers using the SystemJS module fomat.

## Try it Out

I had a lot of fun building the JSPM Generator using this approach and not having to touch a CLI apart from running a local server in dev and leaving it alone - and I really hope this can make JS development more fun for you too.

Please feel free to ask questions or share feedback, this stuff only works in collaboration. And there is still a lot of work to do too if you're interested in getting involved in the project you are more than welcome.

> For questions or further discussion about jspm, [join jspm on Discord](https://discord.gg/dNRweUu). For CDN issues, post to the [project issue tracker](https://github.com/jspm/project).
