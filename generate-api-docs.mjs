import { spawnSync } from 'child_process';
import { createInterface } from 'readline';
import * as path from "path";
import * as fs from "fs";
import pc from "picocolors";
import fetch from 'node-fetch';

const currentDir = path.dirname(new URL(import.meta.url).pathname);
const log = (msg) => console.log(pc.bold(msg));
const spawn = (cmd, args, opts) => {
  const res = spawnSync(cmd, args, { ...opts });
  if (res.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
  return res;
};

// For the CLI, we pull the README from the latest main on github:
const cliRes = await fetch('https://raw.githubusercontent.com/jspm/jspm/main/docs/cli.md')
const cliReadme = await cliRes.text();
fs.writeFileSync(path.join(currentDir, 'pages/docs/cli-readme.md'),
`+++
title = "JSPM CLI - Documentation"
description = "JSPM CLI Documentation"
next-section = "teleporthq-sponsorship"
prev-section = "docs/api"
+++

${cliReadme}
`);

// For the rest of the projects, we generate API docs using typedoc:
const submodules = [
  "generator", // @jspm/generator
  "import-map", // @jspm/import-map
];

for (const submodule of submodules) {
  log(`Generating API documentation for: ${submodule}`);
  const submodulePath = path.resolve(currentDir, `api_repos/${submodule}`);
  const submoduleDocsPath = path.resolve(submodulePath, "docs");
  const outputDocsPath = path.resolve(currentDir, "public_html/api", submodule);
  const typedocJsonPath = path.resolve(submodulePath, "typedoc.json");
  const tsJsonPath = path.resolve(submodulePath, "tsconfig.json");

  // Fetch the current git branch:
  const gitBranch = spawn("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: submodulePath,
    encoding: "utf8",
  }).stdout.trim();
  log(`Current git branch: ${gitBranch}`);

  // For retro-generating old tags, we need to inject the typedoc and
  // typescript config files into the submodule after every checkout:
  const typedocJson = fs.readFileSync(typedocJsonPath, "utf8");
  const tsJson = fs.readFileSync(tsJsonPath, "utf8");

  // We generate API docs for every published semver tag in the submodule:
  const tags = spawn("git", ["tag", "--list"], {
    cwd: submodulePath,
    encoding: "utf8",
  }).stdout.split("\n")
    .map((tag) => tag.trim())
    .filter((tag) => tag.match(/^\d+\.\d+\.\d+$/));
  log(`   Found version tags: ${tags.join(", ")}`);

  for (const tag of tags) {
    log(`   Generating docs for version: ${tag}`);
    spawn("git", ["checkout", tag], { cwd: submodulePath });
    spawn("npm", ["install"], { cwd: submodulePath });

    // We need to inject various configs as older tags don't have the rigging
    // we added for this script to work. We also need to copy over the current
    // build for idempotency:
    fs.writeFileSync(typedocJsonPath, typedocJson);
    fs.writeFileSync(tsJsonPath, tsJson);

    while(true) {
      try {
        spawn("npx", [
          "typedoc",
          "--skipErrorChecking",
          "--tsconfig", tsJsonPath,
          "--options", typedocJsonPath,
        ], { cwd: submodulePath, stdio: "inherit" });
        break;
      } catch(err) {
        log(`   Failed to generate docs for version: ${tag}`);
        log(`   Error: ${err.message}`);

        // Ask the user to fix the issue and try again, or skip this tag:
        const rl = createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        const answer = await new Promise((resolve) => {
          rl.question("   Try again? [y/N] ", (answer) => {
            resolve(answer);
            rl.close();
          });
        });
        if (answer.toLowerCase() !== "y") {
          log(`   Skipping docs for version: ${tag}`);
          break;
        }
      }
    }

    try {
      spawn("git", ["checkout", "."], { cwd: submodulePath });
      spawn("git", ["clean", "-f", "typedoc.json", "tsconfig.json"], { cwd: submodulePath });
    } catch { /* not fatal */ }
  }

  // Copy results to the public_html folder:
  spawn("rm", ["-rf", outputDocsPath], { cwd: currentDir });
  spawn("cp", ["-r", submoduleDocsPath, outputDocsPath], { cwd: currentDir });

  // Clean up all changes to the submodule:
  try {
    spawn("git", ["clean", "-fdx"], { cwd: submodulePath });
    spawn("git", ["checkout", "."], { cwd: submodulePath });
    spawn("git", ["checkout", gitBranch], { cwd: submodulePath });
  } catch { /* not fatal */ }
}

log("Done!");
