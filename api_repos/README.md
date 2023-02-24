This directory contains git submodules for the following packages:
* `@jspm/generator`

The `generate-api-docs.mjs` script in the root of this repository can be used to
automatically generate API documentation for these packages using `typedoc`, and
inject them into the `public_html` build.

At the moment the API docs are placed under `jspm.org/api/<name>`, but we may
want to support versioning in the future.

### Note:

You may have to run `git submodule update --init --recursive` to fetch the
submodules if you have never run the generation before.
