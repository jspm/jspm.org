+++
title = "jspm.io API"
description = "jspm.io API Documentation"
prev-section = "cdn/jspm-io"
+++

# jspm.io API

The jspm.io API is hosted at `https://api.jspm.io` and provides some hosted package management services
for JSPM workflows.

### Reliability Guarantees

Like the CDN itself, this API is designed to have reliable uptime and includes autoscaling under higher load.

The service is supported by project donations and is approaching sustainability. If you plan to heavily rely on this API, and anticipate bringing heavier load, support for the project would always be appreciated.

## Build Queue Request


The `https://api.jspm.io/build` API provides an API for requesting a build of a new package that was recently published and hasn't yet been prioritised in the JSPM build queue.

This API accepts any `GET` request of the form:

`https://api.jspm.io/build/pkg@x.y.z`

It is important to ensure the exact semver version is provided.

The JSON response will either provide an `"error"` field or successfully send the build to the JSPM CDN build queue.

To perform a full package rebuild and cache clear for an existing previously built package, a rebuild token is needed.

If you have a rebuild token this can be provided via the `token` query parameter:

`https://api.jspm.io/build/pkg@x.y.z?token=REBUILD_TOKEN`

If you are working with a large number of packages and require a rebuild token, you can [get in touch to request one](mailto:guybedford@jspm.foundation).

## Generator

The `https://api.jspm.io/generate` API provides a hosted version of [JSPM Generator](https://github.com/jspm/generator) running
as a service.

It is recommended that whenever possible you host and run the JSPM Generator library directly yourself. This API is created as a convenience for runtimes and services that are unable to easily run JavaScript in their environments to generate the map themselves.

### Usage

The `https://api.jspm.io/generate` API accepts either a `GET` or a `POST` request.

`POST` requests are taken as JSON, and return JSON for all requests.

Error responses will always have an `error` field and non-error responses will always omit an `error` field.

When making a `GET` request, each of the arguments is encoded as a string, comma-separated string or JSON encoding for objects, as appropriate.

### install

The main argument to provide is the `install` list which is an array of targets - this is the list of package targets to install, of the form:

```
registry:name@version/subpath
```

The registry is optional, the version can be a partial version like `@5` or even just `@` for the latest non-stable version, and the subpath is optional as well.

### env

The `env` is a list of environment condition strings. The default is `['browser', 'development', 'module']`. It is usually advisable
to provide the `module` condition to ensure ESM modules are used wherever possible.

### inputMap

An optional `inputMap` import map (with imports and scopes) can be provided for custom manual resolutions that should take precedence in the output map.

### provider

The provider sets the [`defaultProvider`](https://jspm.org/docs/generator/stable/interfaces/GeneratorOptions.html#defaultProvider) option in JSPM Generator.

### flattenScope

When provided, this option will return an import map with just `imports` and no scopes whenever possible.

### graph

When provided, this option will include the traced analysis graph in the output, grouped by package boundary.



