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

The generator API provides a hosted version of [JSPM Generator](https://github.com/jspm/generator) running as a service.

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

All of the serializable [JSPM Generator Options](https://jspm.org/docs/generator/stable/interfaces/GeneratorOptions.html) are supported.

### Example

```sh
curl https://api.jspm.io/generate?install=react&env=development
```

Output:

```json
{
  "staticDeps": ["https://ga.jspm.io/npm:react@18.2.0/index.js"],
  "dynamicDeps": [],
  "map": {
    "imports": {
      "react": "https://ga.jspm.io/npm:react@18.2.0/index.js"
    }
  }
}
```

### Options

* `install`: The registry, version and subpath are optional. Versions can also be short ranges - for example `@5` or even just `@` for the latest non-stable version.
* `env`: The default is `['browser', 'development', 'module']`. It is usually advisable to provide the `module` condition to ensure ESM modules are used wherever possible.
* `inputMap`: An optional `inputMap` import map (with imports and scopes) can be provided for custom manual resolutions that should take precedence in the output map.
* `flattenScope`: When provided, this option will return an import map with just `imports` and no scopes whenever possible.
* `graph`: When provided, this option will include the traced analysis graph in the output, grouped by package boundary.

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

The response is a JSON file containing a `pkgUrl` and `files` list providing the URLs to all files in the package.

### Example

```sh
curl http://api.jspm.io/download/jquery@3.7.1?provider=jspm.io
```

Output:

```json
{
  "jquery@3.7.1": {
    "pkgUrl": "https://ga.jspm.io/npm:jquery@3.7.1/",
    "files": ["LICENSE.txt", "README.md", "dist/jquery.js", "dist/jquery.js.map", "dist/jquery.min.js", "dist/jquery.min.js.map", "dist/jquery.min.map", "dist/jquery.slim.js", "dist/jquery.slim.js.map", "dist/jquery.slim.min.js", "dist/jquery.slim.min.js.map", "package.json", "package.json.js", "package.json.js.map", "src/jquery.js", "src/jquery.js.map"]
  }
}
```

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
