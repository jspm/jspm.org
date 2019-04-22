# Tool Integrations

> [Contributions welcome](TODO).

## Jest

> 404

## Mocha

## Parcel

> 404

## Rollup

> - Rollup custom build as a Babel+legacy / modern ES dual bulid, linked from getting started

> - Node.js build ala rollup-plugin-jspm (which will now need --exclude-deps)

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

## Webpack

Note libraryTarget.

Note SystemJS parser options.
