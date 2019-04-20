# Features

The basic concept of jspm is the concept of a workflow for JavaScript based on:

* Installing dependencies
* Easily executing those dependencies, without a build or further configuration, in both the browser and Node using the native JavaScript module loader.
* Enabling workflows for production optimizations on projects, both for building whole applications and libraries.

The stretch long-term mission of the project is to investigate how published packages can be optimized for production-level delivery directly to the browser in a decentralized way for fine-grained cache sharing, and these associatead workflows.

The package manager, ecosystem and linker are all heavily entwined and have to exist together to ensure these workflows don't get brought down by compatibility frictions.