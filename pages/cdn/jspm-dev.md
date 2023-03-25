+++
title = "jspm.dev"
description = "jspm.dev Development CDN"
+++

# jspm.dev CDN

`jspm.dev` provides a modules CDN that does not require import maps, useful for quick prototyping in development, as any module can be loaded directly from the console or in a module script without any other steps being necessary.

To load any npm library in the browser with module scripts with `jspm.dev` try for example:

```html
<script type="module">
  // Statically:
  import babel from 'https://jspm.dev/@babel/core';
  console.log(babel);

  // Dynamically:
  console.log(await import('//jspm.dev/lodash@4/clone'));
</script>
```

## Version URLs

To specify a specific package version target, the following URL versioning patterns are supported:

<table cellpadding="5">
<tr><th style="width: 12em" align=left>jspm.dev/pkg</th><td>Load the main entry point of a package at the latest version.</td></tr>
<tr><th align=left>jspm.dev/pkg@1</th><td>Load the latest ^1 release of the package (includes prereleases).</td></tr>
<tr><th align=left>jspm.dev/pkg@1.2</th><td>Load the latest ~1.2 release of the package (including prereleases).</td></tr>
<th align=left>jspm.dev/pkg@</th><td>Load the edge version of a package. This is the highest possible semver version including prereleases.<tr></td></tr>
<tr><th align=left>jspm.dev/pkg@tag</th><td>Load a tagged package version.</td></tr>
<tr><th align=left>jspm.dev/npm:pkg@1.2.3<br />jspm.dev/pkg@1.2.3</th><td>Load an exact version of a package. The explicit `npm:` registry identifier is optional, to avoid the automatic redirect that is added for forwards compatibility with new registries in future.</td></tr>
</table>

Exact version URLs are cached with far-future expires, while non-exact version URLs are cached with a short expiry to allow dependency updates over time.

Note that only the version of the initial package being requested is being set this way, while the versions of deep dependencies will follow semver resolution.

## Subpaths

Full subpath support is also provided for packages. It is a recommended best practice to use package subpaths where possible to load specific package features, instead of loading all package code when some of it might be unused:

<table cellpadding=5>
<tr><th style="width: 12em" align=left>jspm.dev/pkg/subpath</th><td>Load a subpath of a package - applies to all version patterns above.</td></tr>
</table>

Packages that have an [exports field](#exports-field) defined will expose the subpaths corresponding to the exports field. For packages without an exports field, a [statistical analysis](/jspm-dev-release#subpath-detection) process is used to determine the subpaths of a package in code splitting optimization.

## Environment Conditions

`jspm.dev` will always serve modules using the `"development"`, and `"browser"` [exports conditions](#conditional-exports).

As a result packges like React or Lit will run in their development modes, which may include a console message about this.

If needing to customize the environment, use `jspm.io` instead, which allows setting the conditional environment via the import map.
