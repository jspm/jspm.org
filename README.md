# JSPM.ORG

## Local Setup

If you don't have core access to JSPM as a core contributor, fork and clone import-map, generator, and jspm-cli.
JSPM.ORG is built using git submodules, so you'll need to fork and clone the submodule repositories as well.

To do this quickly, use the Github CLI; nstallation Instructions [here](https://cli.github.com/).

### Submodule Setup

Fork and clone each of the submodule repositories:

```bash
gh repo fork jspm/import-map --clone && \
gh repo fork jspm/generator --clone && \
gh repo fork jspm/jspm-cli --clone
```

Clone the jspm.org repository:

```bash
gh repo fork jspm/jspm.org --clone
```

Set up the submodules:

```bash
git submodule update --init
```

To ensure your submodules are up to date, run:

```bash
git submodule update --remote
```

### Node setup

Insure you're using the correct version of node:

```bash
n i auto
# or nvm i
```

Recursively install node modules:

```bash
npm install --recursive
```

### Chomp Setup (local development)

Install chomp globally:

```bash
npm install -g chomp
```

Now you should be able to build the site:

```bash
chomp build
```

And to serve and watch for changes to `pages`:

```bash
chomp build --serve
```

### Troubleshooting

Typedoc publishes breaking changes with feature updates. This may cause builds to fail.
> To fix this, ensure you're using the exact version of Typedoc and you're using the correct version of node.

File already exists error:
> Delete the file/folder and try again.

Version mismatch:
> Ensure git submodules are up to date. Update the versions specified in the root `chompfile.toml`.
