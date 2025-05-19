+++
title = "jspm.io API"
description = "jspm.io API Documentation"
prev-section = "cdn/jspm-io"
+++

# jspm.io API

The jspm.io API is hosted at `https://api.jspm.io` and provides some hosted package management services for JSPM workflows.

### Reliability Guarantees

Like the CDN itself, this API is designed to have reliable uptime and includes autoscaling under higher load.

The service is supported by project donations and is approaching sustainability. If you plan to heavily rely on this API, and anticipate bringing heavier load, support for the project would always be appreciated.

## Generator

The generator API provides a hosted version of [JSPM Generator](https://github.com/jspm/jspm/tree/main/generator) running as a service.

It is recommended that whenever possible you host and run the JSPM Generator library directly yourself. This API is created as a convenience for runtimes and services that are unable to easily run JavaScript in their environments to generate the map themselves.

### Usage

GET:

```
https://api.jspm.io/generate?[queryParams]
```

Or POST:

```
https://api.jspm.io/generate
```

with a JSON payload for options.

The JSON response contains `{ staticDeps, dynamicDeps, map }`, where `staticDeps` and `dynamicDeps` represent the static dependency graph and dynamic import dependency graph respectfully,
which can be used to generate preload tags.

Error responses will always have an `error` field and non-error responses will always omit an `error` field.

When making a `GET` request, each of the arguments is encoded as a string, comma-separated string or JSON encoding for objects, as appropriate.

All of the serializable [JSPM Generator Options](https://jspm.org/docs/generator/interfaces/GeneratorOptions.html) are supported.

### Examples

Install a module for a development environment:

```sh
curl 'https://api.jspm.io/generate?install=react&env=development'
```

Output:

```json
{
  "staticDeps": ["https://ga.jspm.io/npm:react@18.2.0/dev.index.js"],
  "dynamicDeps": [],
  "map": {
    "imports": { "react": "https://ga.jspm.io/npm:react@18.2.0/dev.index.js" }
  }
}
```

Install a module for a browser production environment:

```sh
curl -X POST -d '{ "install": ["react"], "env": ["browser", "production", "module"] }' https://api.jspm.io/generate
```

Output:

```json
{
  "staticDeps": ["https://ga.jspm.io/npm:react@18.2.0/index.js"],
  "dynamicDeps": [],
  "map": {
    "imports": { "react": "https://ga.jspm.io/npm:react@18.2.0/index.js" }
  }
}
```

Update a module in an existing map:

```sh
curl -X POST -d '{ "inputMap": { "imports": { "react": "https://ga.jspm.io/npm:react@18.0.0/index.js" } }, "update": ["react"], "env": ["browser", "production", "module"] }' https://api.jspm.io/generate
```

Output:

```json
{
  "staticDeps": ["https://ga.jspm.io/npm:react@18.2.0/index.js"],
  "dynamicDeps": [],
  "map": {
    "imports": { "react": "https://ga.jspm.io/npm:react@18.2.0/index.js" }
  }
}
```

### Generate Operation

One of the following generate operation options must be provided (it is an error to provide none or multiple at the same time):

- `install`: The registry, version and subpath are optional. Versions can also be short ranges - for example `@5` or even just `@` for the latest non-stable version (optionally used with `inputMap` to install into an existing map).
- `update`: Used with `inputMap`, a list of specifiers in the import map (left hand side) to update can be provided in an existing map.
- `uninstall`: Used with `inputMap`, a list of specifiers in the import map (left hand side) to remove from the map.
- `link`: Used with `inputMap`, a list of specifiers in the import map to generate a "sub map" for. This allows, for example, to generate smaller maps from a larger one that respect the same version resolutions.

### Options

- `env`: The default is `['browser', 'development', 'module']`. It is usually advisable to provide the `module` condition to ensure ESM modules are used wherever possible.
- `inputMap`: An optional `inputMap` import map (with imports and scopes) can be provided to generate over an existing import map (installing a package into an existing project, while keeping existing resolutions).
- `flattenScope`: When provided, this option will return an import map with just `imports` and no scopes whenever possible.
- `graph`: When provided, this option will include the traced analysis graph in the output, grouped by package boundary.

## Download

For local workflows it can be beneficial to have a package download system where import maps are rewritten to the local hosted packages as necessary,
using simple replacement of the package URL with a local or self-hosted version.

To download CDN packages the JSPM download API can be used to obtain a file listing of packages across some of the core providers that support this.

> `esm.sh` and `skypack` do not currently support the package file listing API for downloads.

### Usage

GET:

```
https://api.jspm.io/download/[pkgName]@[version]
```

Multiple packages can be provided with comma-separation - `[pkgName]@[version],[pkgName]@[version]`.

The full exact version is required.

The response is a JSON file containing a `pkgUrl` and `files` list providing the URLs to the files in the package.

### Examples

```sh
curl https://api.jspm.io/download?packages=jquery@3.7.1&provider=jspm.io
```

Output:

```json
{
  "jquery@3.7.1": {
    "pkgUrl": "https://ga.jspm.io/npm:jquery@3.7.1/",
    "files": [
      "LICENSE.txt",
      "README.md",
      "dist/jquery.js",
      "dist/jquery.js.map",
      "dist/jquery.min.js",
      "dist/jquery.min.js.map",
      "dist/jquery.min.map",
      "dist/jquery.slim.js",
      "dist/jquery.slim.js.map",
      "dist/jquery.slim.min.js",
      "dist/jquery.slim.min.js.map",
      "package.json",
      "package.json.js",
      "package.json.js.map",
      "src/jquery.js",
      "src/jquery.js.map"
    ]
  }
}
```

```sh
curl -X POST -d '{ "packages": ["jquery@3.7.1", "jquery@3.7.0"], "provider": "jsdelivr", "exclude": ["sourcemaps", "types", "unused"] }' https://api.jspm.io/download
```

Output:

```json
{
  "jquery@3.7.1": {
    "pkgUrl": "https://cdn.jsdelivr.net/npm/jquery@3.7.1/",
    "files": ["LICENSE.txt", "README.md", "dist/jquery.js", "package.json"]
  },
  "jquery@3.7.0": {
    "pkgUrl": "https://cdn.jsdelivr.net/npm/jquery@3.7.0/",
    "files": ["LICENSE.txt", "README.md", "dist/jquery.js", "package.json"]
  }
}
```

### Options

- `provider`: CDN provider to download from: `jspm.io` | `jsdelivr` | `unpkg` (defaults to `jspm.io`).
- `exclude`: Packages can have a large number of files, and often include files which aren't even used for module loading. The `exclude` option allows for filtering the file list down to only those files needed. It's a list of the following options:
  - `unused`: Exclude unused modules which aren't reachable from the public package module graph through its package exports or imports or entry points. Will automatically filter types and sourcemap files to this public graph where possible as well (unless they are also excluded).
  - `types`: Exclude TypeScript and type definition files.
  - `sourcemaps`: Exclude sourcemap files.
  - `readme`: Exclude readme files.
  - `license`: Exclude license files.

## Build Queue Request

The `https://api.jspm.io/build` API provides an API for requesting a build of a new package that was recently published and hasn't yet been prioritised in the JSPM build queue.

### Usage

GET:

```
https://api.jspm.io/build/[pkgName]@[version]
```

The JSON response will either provide an `"error"` field or successfully send the build to the JSPM CDN build queue.

To perform a full package rebuild and cache clear for an existing previously built package, a rebuild token is needed.

If you have a rebuild token this can be provided via the `token` query parameter:

`https://api.jspm.io/build/pkg@x.y.z?token=REBUILD_TOKEN`

If you are working with a large number of packages and require a rebuild token, you can [get in touch to request one](mailto:guybedford@jspm.foundation).
