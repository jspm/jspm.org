This directory contains git submodules for the following packages:
* `@jspm/generator`
* `@jspm/import-map`

The `generate-api-docs.mjs` script in the root of this repository can be used to
automatically generate API documentation for these packages using `typedoc`, and
inject them into the `public_html` build. The script runs through each version
tag in each package, and tries to generate the documentation.

If generation fails for a particular version tag, you will be prompted to
retry. You can make any changes you need to make in the git submodule before
retrying, and the script will automatically clean them up before moving on to
the next version.

Common issues:
* You may have to run `git submodule update --init --recursive` to fetch the
submodules if you have never run the generation before.
* If you see warnings about multiple versions of `typedoc` being loaded, you
  may need to uninstall the `typedoc` dependency in the git submodule, if it
  exists, before retrying.
