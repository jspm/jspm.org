+++
title = "Shutting down dev.jspm.io after 10 years"
description = "With import maps successfully being supported natively, the JSPM project is moving to only support import map CDN workflows via the ga.jspm.io CDN, while jspm.dev & dev.jspm.io are being deprecated after 10 years of operation."
+++

# Shutting down `dev.jspm.io` after 10 years
<p style="text-align: right; margin-top: -4em; margin-bottom: 4em; font-size: 0.9em;"><em>Guy Bedford, November 22<sup style="padding-left:0.15em">nd</sup> 2023</em></p>

Over 10 years ago, I made the first release of `dev.jspm.io`. It was 2013 and I wanted to explore the sorts of workflows native browser modules could enable, driven by my experience building SSR apps that could benefit from lazy dynamic linking. I got the initial working demonstrating loading from npm directly inside the browser console where any import would just work - `require(['dev.jspm.io/x'])` and later `then built out a second CDN, `cdn.jspm.io` two CDNs - this first demo, , `dev.jspm.io`, and then the proper CDN, where the JSPM CLI built the correct RequireJS map configuration, `cdn.jspm.io`. There was a lot of interest in the project at the time into what became a 10-year open source endeavor.

Fast-forward to today, and import maps are now supporetd natively in all browsers. The future these demos spoke to is now truly here. And the JSPM project no longer needs to maintain two CDNs - we only need the import maps one, `ga.jspm.io`, on top of which production-ready import maps can be generated for any npm packages, providing the superior caching benefits of import maps in supporting far-future expires for all resources.

The main architecture restriction for the non-import-map CDN variant is that it requires a choice:

1. Populate resolution information on-the-fly, building it for the user making the request.
2. Populate default resolution data, based on always getting the latest versions of all dependencies. This results in unwanted version forks.

In addition, only the `browser` and `development` package conditions work for the dev CDN, while full exports mapping support can be provided for import maps workflows.

## Deprecation Timeline

We've always provided long deprecation timelines, upgrade paths, and uptime guarantees for our projects & CDN services and this is no exception.

Starting from 24 November, no new package builds will be supported on `jspm.dev` or the `dev.jspm.io` mirror. All existing package builds and URLs that have worked through the CDN will continue to work.

The CDN will then continue to remain live for another two years until 1 November 2025.

## `ga.jspm.io` CDN Growth

Since the latest release of the native import maps CDN `ga.jspm.io` in March 2021, the native import maps CDN has grown to 1.5 billion requests per month at an average rate of 10% usage per month.

<div style="text-align: center;">
<img style="dispay:block" src="requests-2023.png" />
</div>

In this same time, `dev.jspm.io` / `jspm.dev` hasn't been growing, remaining fairly consistently at 100 million requests per month. The numbers justify the deprecation at this point in time as the majority of users are already switching over to full import map workflows.

## Reliable, Sustainable Infrastructure

CDN performance, scalability and reliability are the primary priority for the project for `ga.jspm.io` to be a fast and reliable production CDN, and a lot of work has been going on behind the scenes towards these goals.

The last couple of months we went live with our new self-hosted infrastructure - the entire CDN build queue is now running on our own servers, building all packages on npm. Many called this approach overkill, but it's important to reliability. If the build queue could be DDOSed as easily as iterating on its build URLs, the entire project could turn unsustainable in an instant, based on the whims of a single user. By restricting the builds to only known URLs, and further building all those upfront, we sustainably bound our compute at its upper bound creating resiliance, while still using Google Cloud for our smaller critical services.

It only costs us $2000 USD per month for all of this infrastructure, mainly thanks to our CDN sponsors CacheFly for fronting the main CDN edge for us.

We receive approximately $800 USD in CDN sponsorships per month from our primary sponsors Basecamp & Socket.io. That still leaves us with a $1000 USD monthly shortfall, but we are 50% of the way towards full financial sustainability for the CDN through the JSPM Foundation.

For the remaining 50%, this will be a goal for the project over the next 6 - 12 months. We are confident the renewed interest in native import maps CDNs and an understanding of the importance of this infrastructure will help us meet the remaining 50%.

## Latest Project Releases

The JSPM Generator and CLI projects have also had releases this week, see the release notes below for more details on their developments:

* JSPM Generator 2.0.0 Release Notes
* JSPM CLI 1.0.4 Release Notes

Thanks to all who reviewed this post.

Thanks to our JSPM core team and contributors:

Jaya Krishna Namburu
Jarred de Beer

