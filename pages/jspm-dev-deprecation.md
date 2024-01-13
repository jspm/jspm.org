+++
title = "Deprecating jspm.dev"
description = "With import maps fully supported in browsers, the JSPM project is moving to only support import map CDN workflows via the ga.jspm.io CDN, while jspm.dev is being deprecated over a two year timeframe."
+++

# Deprecating `jspm.dev`
<p style="text-align: right; margin-top: -4em; margin-bottom: 4em; font-size: 0.9em;"><em>Guy Bedford, January 13<sup style="padding-left:0.15em">th</sup> 2024</em></p>

The first release of `dev.jspm.io` was made in 2013 - I was exploring the sorts of workflows native browser modules could enable, driven by my experience building component-based SSR apps. I found that late dynamic module loading was beneficial in these workflows where the full component list being rendered can only truly be known at edge render time, too late to have this information performantly affect bundling.

The initial version of JSPM demonstrated loading from npm directly inside the browser console. Any import would just work - first implemented for RequireJS, later on SystemJS, and then finally for native ES modules via `jspm.dev`, which was [launched in 2017](/jspm-dev-release).

The `jspm.dev` CDN version was really needed only for the brief timeframe in 2017 where native modules were fully supported but it was not yet clear if import maps would be supported across browsers. By not relying on import maps, this CDN would dynamically insert the correct versions for all specifiers.

Fast-forward to today, and import maps are supported natively in all browsers. The future those 2013 demos spoke to is now truly here. Because of this, JSPM no longer needs to maintain two CDNs - we only need the import maps one, `ga.jspm.io`. With `ga.jspm.io`, production-ready import maps can be generated for any npm package with the superior version locking and caching benefits of import maps in supporting far-future expires for all resources.

## Deprecation Timeline

We've always provided long deprecation timelines, upgrade paths, and uptime guarantees for our projects & CDN services and this is no exception.

**Starting from today, no new package builds will be supported on `jspm.dev` or the `dev.jspm.io` mirror. All existing package builds and URLs that have worked through the CDN will continue to work.**

The CDN will then continue to remain live for another two years until 1 January 2026, at which point it will be put offline.

_For help migrating to `ga.jspm.io` and the JSPM Generator, see the [Getting Started](/getting-started) guide._

## `ga.jspm.io` CDN Growth

Since the latest release of the native import maps CDN `ga.jspm.io` in March 2021, the native import maps CDN has grown to 1.5 billion requests per month at an average rate of 10% usage per month.

<div style="text-align: center;">
<img style="dispay:block" src="requests-2023.png" />
</div>

In this same time, `dev.jspm.io` / `jspm.dev` has not been growing, remaining fairly consistently at 100 million requests per month. The numbers justify the deprecation at this point in time as the majority of users are already switching over to full import map workflows.

## Static Module CDN Benefits

The benefit of maintaining only `ga.jspm.io` from an infrastructure point of view is that architecturally nothing more than a static file server. Builds are queued so there is no complex infrastructure that needs to boot up when a request is sent to serve a package. There is no edge application doing dynamic package creation or import rewriting or user customizations. It's **simply static files** and that is all.

This significantly reduces the cost overhead in comparison to `jspm.dev`. By ensuring costs are a very low multiple of growth, we enable sustainability without having to restrict growth.

## Reliable, Sustainable Infrastructure

CDN performance, scalability and reliability are the primary priority for the project for `ga.jspm.io` to be a fast and reliable production CDN, and a lot of work has been going on behind the scenes towards these goals.

The last couple of months `ga.jspm.io` migrated seamlessly to the new self-hosted build infrastructure - the entire CDN build queue is now running on our own servers, building all packages on npm. Many called this approach overkill, but it's important to reliability - if the build queue could be DDOSed as easily as iterating on its build URLs, the entire project could turn unsustainable in an instant, based on the whims of a single malicious user. By restricting the builds to only known URLs, and further building all those upfront statically, we sustainably bound our compute at its upper bound creating resiliance.

It costs $2000 USD per month for all of this infrastructure, mainly thanks to our CDN sponsors CacheFly for fronting the main CDN edge for us.

We receive approximately $1100 USD in CDN sponsorships per month from our primary sponsors Basecamp, Socket.io & Framer. That still leaves us with a $900 USD monthly shortfall, but that we are more than halfway towards full financial sustainability for the CDN through the JSPM Foundation is a pretty great achievement.

Thanks to our JSPM core team and contributors for keeping the project going, it would not have been possible without you!

* Jaya Krishna Namburu
* Jarred de Beer
* Jeff Wainwright

And of course to our sponsors!

## Latest Releases

Latest release updates from the last week:

* [JSPM CLI 3.2.0](https://github.com/jspm/jspm-cli/releases/tag/3.2.0)
* [node-importmap-loader 0.2.1](https://github.com/jspm/node-importmap-loader/releases/tag/0.2.1)

