# Background

## Project History

jspm was first started in 2013 as a package manager to enable npm package loading directly in the browser over a CDN with RequireJS, the dominant browser module system of the time. The package manager would construct the RequireJS map configuration while the CDN would use the RequireJS CommonJS wrapper, allowing npm packages to be loaded directly in the browser without any build step being necessary.

In 2014 the jspm project was updated to use SystemJS as the module loader, following what was then the early iteration of the WhatWG Loader API specification that was at the time the main proposal to support ES modules in browsers. The jspm package manager CLI was released alongside SystemJS to provide installation that ran the CDN package management transforms locally, as well as providing optimization workflows, in order not to be reliant on the CDN but have a fully independent workflow. The System module format was developed at this time to support ES module semantics as its own module format, since live bindings and circular references have a different behaviour to AMD and CommonJS modules.

Towards the end of 2014 and through 2015 with the release of Babel and the rise of tools like Webpack, there was a tremendous ecosystem push from users to have tools support modern ES6 syntax and features as the ES2015 shipping date drew near. SystemJS already supported in-browser transformation of ES modules to enable easy in-browser workflows, which was extended to support full Babel and TypeScript transforms.

In 2015, this both drove the major adoption of the project and also ultimately led to a dead end, in that running all of this transpilation in the browser was never a very good idea. SystemJS builder following the same in-browser transform semantics resulted in having to manage a very complex gap between the server and browser compilation models, from dealing with caching to cross-module metadata requirements. Later in 2015 the WhatWG Loader spec was also largely abandoned, in favour of a more straightforward ES modules integration in browsers based purely on URLs without any in-browser loader hooks being supported.

This left both SystemJS and jspm in a difficult situation - strong user growth was at the same time combined with both the architectural dead end of in-browser transforms and the architectural shift of the loader specification changes. Simple things like having no in-browser resolution hook meant it would no longer be possible to support adding file extensions to module imports, these combined architectural details being huge changes for the project to adapt to.

From 2016 to 2019 SystemJS was rebuilt into a highly performant System module format loader for running ES module semantics in older browsers - now [almost as fast as native modules](https://github.com/systemjs/systemjs#performance) - while the jspm 0.17 and then jspm 2.0 releases aimed to bring back the optimization and CDN workflow alignment for the new modules specification base of a non-hookable loader architecture, competing directly with npm on feature parity.

jspm 2.0 nearly attained at this goal, providing CJS to ES module conversion locally on install that would add file extensions, support for import map generation in browsers and Node.js, and competing directly with npm features as a package manager, but it ultimately could not succeed. The fact is that to compete with npm on JS package management requires 100% feature parity, and while jspm was incredibly close to this, running a CJS to ES module conversion locally simply couldn't work in all Node.js application use cases (despite the fact that it can in the browser due to parity with Browserify and Webpack semantics). It wasn't a great npm alternative, and import maps were still too early to adopt in browsers despite ES Module Shims making this possible. There were also deep communication problems in getting across the conceptual changes of the project given its history at this point.

Throughout this time though, the original jspm.io CDN had continued to gain in popularity, hitting millions of requests per month. With each update to the jspm CLI, the semantics and support on the CDN continued to be updated and matched between the systems, and package compatibility continued to improve. With the release of Deno and interest in tools like Yarn PnP and Tink, the concepts of URL-based and on-demand module delivery also started to be established in the JS ecosystem. Node.js had also finally launched full support for ECMAScript modules, another one of the missing pieces jspm had aimed to fill in enabling universal workflows in JavaScript now complete.

In June 2020 the tough decision was made to deprecate the jspm package management CLI as an npm alternative entirely, and jspm.dev was released - a fully revamped, optimized and scaled version of the CDN as a URL-only package system working with native modules in all browsers. Work continues on improving these modular workflows.

> If you'd like to support jspm, consider [donating to the Open Collective](https://opencollective.com/jspm).

## Project Goals

The major goal for jspm is to see decentralized delivery of JavaScript that allows for optimized code delivery with cache sharing while ensuring maximum privacy and trust. Achieving this goal poses some challenges, given the nature of the problem and the fact that a centralized service is in many ways its antithesis.

jspm aims to use the organizational momentum of starting from a CDN service to continue to focus on supporting specifications, protocols, conventions and open source projects that build toward such fully decentralized models in order to best assist with enabling the open systems necessary to provide these properties.

## Team

### Core Team

<img src="/profile-3.webp" style="float: left; margin-right: 1em; width: 10em">

<strong>Guy Bedford</strong>

Guy is an open source software developer and core contributor to SystemJS, jspm, Node.js and RollupJS. He has spent far too much time than is sensible working on JavaScript modules. He stays for the summers between Vancouver and Cape Town, where he regularly enjoys pretending to surf.<br /><br /><br />

<img src="/0.jpg" style="float: left; margin-right: 1em; width: 10em; clear: both;">

<strong>Jarred de Beer</strong>

Jarred works as an Algorithmic Trading Developer at Rand Merchant Bank focused on systems for risk reporting workflows. In previous lives he's worked as a front-end web developer and also as an animator specializing in figure drawing and character rigging.<br/><br/><br/>

<img src="/zach-2013-8-x-10.jpg" style="float: left; margin-right: 1em; width: 10em; clear: both;">

<strong>Zachary Smith</strong>

Zach is a software tinkerer working at SAEON, the South African Environment Observation Network. He holds an M.Sc. in Information Technology from the University of Cape Town and an Honours Degree in Geology. He's also an accomplished musician and can be found on Spotify if you look hard enough.<br /><br/>

<div stlye="clear:both;">

### Advisors

<img src="/7zdggNNz_400x400.png" style="float: left; margin-right: 1em; width: 10em; clear: both">

<strong>Yaseer Sheriff</strong>

Yaseer is the co-founder and CEO of [axiom.ai](https://axiom.ai), a tool for browser automation. He is also a researcher in Computer Science investigating models of the lambda calculus relevant to computational biology.

<div style="clear:both;">
