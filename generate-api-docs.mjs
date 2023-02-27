import { spawnSync } from 'child_process';
import { createInterface } from 'readline';
import * as path from "path";
import * as fs from "fs";
import pc from "picocolors";

const log = (msg) => console.log(pc.bold(msg));

const submodules = [
  // "generator", // @jspm/generator
  "import-map", // @jspm/import-map
];

for (const submodule of submodules) {
  log(`Generating API documentation for: ${submodule}`);
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  const submodulePath = path.resolve(currentDir, `api_repos/${submodule}`);
  const submoduleDocsPath = path.resolve(submodulePath, "docs");
  const outputDocsPath = path.resolve(currentDir, "public_html/api", submodule);
  const typedocJsonPath = path.resolve(submodulePath, "typedoc.json");
  const tsJsonPath = path.resolve(submodulePath, "tsconfig.json");

  // Fetch the current git branch:
  const gitBranch = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: submodulePath,
    encoding: "utf8",
  }).stdout.trim();
  log(`Current git branch: ${gitBranch}`);

  // For retro-generating old tags, we need to inject the typedoc and
  // typescript config files into the submodule after every checkout:
  const typedocJson = fs.readFileSync(typedocJsonPath, "utf8");
  const tsJson = fs.readFileSync(tsJsonPath, "utf8");

  // We generate API docs for every published semver tag in the submodule:
  const tags = spawnSync("git", ["tag", "--list"], {
    cwd: submodulePath,
    encoding: "utf8",
  }).stdout.split("\n")
    .map((tag) => tag.trim())
    .filter((tag) => tag.match(/^\d+\.\d+\.\d+$/));
  log("   Found version tags: ", tags);

  for (const tag of tags) {
    log(`   Generating docs for version: ${tag}`);
    spawnSync("git", ["checkout", tag], { cwd: submodulePath });

    // We need to inject various configs as older tags don't have the rigging
    // we added for this script to work. We also need to copy over the current
    // build for idempotency:
    fs.writeFileSync(typedocJsonPath, typedocJson);
    fs.writeFileSync(tsJsonPath, tsJson);
    const initialCopyRes = spawnSync("cp", ["-r", outputDocsPath, submoduleDocsPath]);
    if (initialCopyRes.status !== 0) {
      console.error(initialCopyRes.error);
      process.exit(1);
    }

    spawnSync("npx", [
      "typedoc",
      "--tsconfig", tsJsonPath,
      "--options", typedocJsonPath,
    ], { cwd: submodulePath });

    // Copy results back to current build:
    //const copyRes = spawnSync("cp", ["-r", submoduleDocsPath, outputDocsPath]);
    //if (copyRes.status !== 0) {
    //  console.error(copyRes.error);
    //  process.exit(1);
    //}

    // Clean out everything in the submodule for next version generation:
    //spawnSync("git", ["clean", "-fdx"], { cwd: submodulePath });
    //spawnSync("git", ["checkout", "."], { cwd: submodulePath });
  }

  // Reset the submodule to the original branch:
  spawnSync("git", ["checkout", gitBranch], { cwd: submodulePath });
}

log("Done!");
