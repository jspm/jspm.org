# Getting Started

## Install jspm 2.0 beta

Make sure your GitHub SSH keys are configured correctly then:

```
npm install -g git+ssh://git@github.com/jspm/jspm2-cli#2.0
```

Also make sure to run NodeJS 10.x or greater.

To see the full list of options available run `jspm help`. This guide only touches on the basics.

## Create a Project

```
mkdir jspm-test
cd jspm-test
```

## Install Dependencies

As expected:

```
jspm install lodash @babel/core
```

This will populate the dependencies in `package.json` and also generate a `jspm.json` lockfile. _Do not delete either of these, as both are used by the resolver._

> A lot of effort has been made to make installs run really fast. There's also support for `install --offline` and `install --prefer-offline` as expected these days.

## Executing ES Modules

test.js
```js
import clone from 'lodash/clone.js';

console.log(clone({ a: 'b' }));

import('@babel/core').then(({ default: babel }) => {
  console.log(babel.transform('test').code);
});
```

```
jspm test.js
```

When executing jspm is using the NodeJS `--experimental-modules` feature directly, configuring the jspm resolver through the NodeJS `--loader` hooks so this is using full native ES module support in Node.js.

> This will support Node 8.x and up, although dynamic import is only supported in Node 10.x and up

To see how jspm is executing Node.js running `jspm bin` will output the Node.js execution command:

```
jspm bin
```

This command can be used directly to execute Node.js with the jspm resolution - all jspm needs to work in any execution environment, builder or other tool is a resolver hook to integrate the jspm_packages resolution.

## Execution in the Browser

To run a local server lets install `http-server` from npm with jspm:

```
jspm install http-server --dev
jspm_packages/.bin/http-server
```

> If running in Windows, use `jspm_packages/.bin/http-server.cmd` in the above.

jspm supports many npm packages using the same jspm_packages resolution and ES module conversion that we run in the browser.
It's all running through --experimental-modules, ES modules and the jspm resolver.

We can then set this up with a package.json script just like with npm:

```json
{
  "scripts": {
    "serve": "http-server"
  }
}
```

which will then support:

```
jspm run serve
```

Now to execute our original example in the browser, we can create a import map:

```
jspm map ./test.js -o importmap.json
```

This will create just the maps necessary to load `lodash/clone`.

> `jspm map` with no arguments will create the full import map for everything that is installed. By default import maps are created based on browser development environment. Passing `--production` will resolve based on the production conditional.

To support import maps in the browser, we need to use the es-module-shims project:

```
jspm install es-module-shims --dev
```

To find out where `es-module-shims` is located we can use `jspm resolve`:

```
jspm resolve --relative es-module-shims
jspm_packages/npm/es-module-shims@0.2.3/dist/es-module-shims.js
```

We can then reference this path to load that file directly in an HTML file:

test.html
```html
<!doctype html>
<script type="module" src="jspm_packages/npm/es-module-shims@0.2.3/dist/es-module-shims.js"></script>
<script type="importmap-shim" src="importmap.json"></script>
<script type="module-shim" src="test.js"></script>
```

Running `jspm run serve` we can load this page to see the expected results in the console.

**We are loading 100s of ES modules converted from Node.js semantics to work natively in the browser with only a import map.**

> [ES Module Shims](https://github.com/guybedford/es-module-shims) supports package name maps only for browsers that already support ES modules. Its module lexing is fast enough that it is actually suitable for prodution workflows. When import maps are natively supported in browsers, this project will no longer be necessary.

## Building for the Browser

Since Lodash is not optimized for browser delivery we still want to do a modular build for production.

To build with Rollup, we can use the `jspm build` command:

```
jspm build test.js --inline-deps
```

> By default `jspm build` will build for the browser development environment. Use `--node` to build for Node.js resolution (not applying the package.json "browser" field, or similarly `--production` for the production environment).

By default, jspm will automatically treat any `"dependencies"` of the project as externals, so `--inline-deps` will ensure lodash and babel are bundled into our build files.

This will output a file at `dist/test.js` containing our build.

We can now update the test page to reference this build file:

test-build.html
```html
<!doctype html>
<script type="module" src="jspm_packages/npm/es-module-shims@0.2.3/dist/es-module-shims.js"></script>
<script type="module-shim" src="dist/test.js"></script>
```

Loading the page in the browser with `jspm run serve` notice how we are just loading three files now:

* The initial chunk that loads lodash/clone
* The dynamic chunk that loads Babel
* A shared chunk containing dependencies shared between both of the above

We thus have an optimal build for distributing to users for a fast load.

> Use `--watch` for a watched build while developing.

## Building for Legacy Browsers

To support this same code in legacy browsers, we build into the SystemJS module format:

```
jspm build test.js -f system -o dist-system --inline-deps
```

Install SystemJS, and verify its path:

```
jspm install systemjs --dev
```

We can then update `test-build.html` to work in both legacy and modern browsers with the following:

```html
<!doctype html>
<script type="module" src="jspm_packages/npm/es-module-shims@0.2.3/dist/es-module-shims.js"></script>
<script type="module-shim" src="dist/test.js"></script>

<script nomodule src="jspm_packages/npm/systemjs@3.1.0/dist/s.min.js"></script>
<script nomodule>System.import('./dist-system/test.js')</script>
```

Since both es-module-shims and SystemJS support import maps, we can provide full modular workflows using these techniques back to IE11!

For IE11 support, [see the polyfills section of the SystemJS readme](https://github.com/systemjs/systemjs#polyfills-for-older-browsers),
note the appropriate Babel plugins for browser support would need to be applied as well, see the custom builds section shortly.

## Partial Builds

A key concept that is enabled by the fact that we are building ES modules is that unlike previous bundling approaches, there is no cost to iterative builds.

That is, we can build parts of an application together, then bundle those parts into other importers again. Building can mix in this way any number of times.

For example, say `test.js` was split into two separate files:

test.js
```js
import clone from 'lodash/clone.js';
import './test-babel.js';

console.log(clone({ a: 'b' }));
```

test-babel.js
```js
import('@babel/core').then(({ default: babel }) => {
  console.log(babel.transform('test').code);
});
```

Now lets leave out the `--inline-deps` option:

```
jspm build test.js
```

Even though we've now done a build, we can still generate a import map for the built application, and only the external packages used will be included:

```
jspm map ./dist/test.js -o importmap.json
```

Alternatively, if lodash/clone.js was small enough it might make sense to inline, leaving only the Babel dependency external:

```
jspm build test.js --inline-deps --external lodash/clone.js
```

It is this kind of balance that needs to be worked out in configuring the external boundary for the local build.

Ideally, this kind of partial build should be done for all packages before publishing.

> While Babel and Lodash are not optimized themselves, if all packages performed these sorts of optimizations on publish, then we would be getting 10s of requests in the browser not 100s, and these workflows may even become suitable in production.

## Running a Custom Build

The `jspm build` command only offers the very basic JS semantics for builds. For custom build configurations, you'll usually want
to "eject" out of this workflow and just use Rollup directly.

Let's do that now:

```
jspm install rollup rollup-plugin-jspm=github:jspm/rollup-plugin-jspm --dev
```

Create the following `rollup.config.js`:

```js
import jspmPlugin from 'rollup-plugin-jspm';

export default {
  input: ['test.js'],
  output: {
    dir: 'dist',
    format: 'esm'
  },
  plugins: [jspmPlugin({
    env: {
      production: true
    }
  })]
};
```

We can then run `jspm_packages/.bin/rollup -c` or again set this up as a package.json "scripts" entry.

> To build for Node.js set the `env.node: true` build flag.

In this way we can now add any custom configuration support for Babel / TypeScript etc.

Because the jspm plugin is just a `resolve` function in Rollup, it is very simple to make plugins for Webpack, Parcel and other tools. Help expanding this is very welcome!

## CDN Package Maps

Instead of building a import map against the local jspm_packages packages folder, the jspm CDN can be used instead as the import map target.

To do this in the original import map example we just add the `--cdn` flag:

```
jspm map ./test.js -o importmap.json --cdn
```

Loading the previous `test.html` in the browser, in the network tab all requests are now made against `https://mapdev.jspm.io`.

Because the structure of jspm_packages is universal, we can just change the reference in this way.

To use a custom jspm_packages path such as your own CDN library server use `--jspmPackages https://mysite.com` rather.

## Further Features not yet covered in this tutorial or docs

TODO: flesh these out!

(see also `jspm help`)

* `jspm clean` to clear jspm_packages
* `jspm link` for linking local projects
* `jspm checkout` for modifying installed packages
* Custom registries
* Global configuration API
* Authentication management
* `jspm resolve`
* Map configuration and conditional resolution
* `jspm publish` for publishing
