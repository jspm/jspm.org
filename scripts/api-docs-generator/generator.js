import { spawnSync } from 'child_process';
import * as path from "path";
import * as fs from "fs";
import pc from "picocolors";

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const projectDir = new URL("../..", import.meta.url).pathname;
const log = (msg) => console.log(msg);
const spawn = (cmd, args, opts) => {
  const res = spawnSync(cmd, args, { ...opts });
  if (res.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
  return res;
};

const submodules = [
  "jspm",
  "generator",
  "import-map",
];

for (const submodule of submodules) {
  // TODO: some kind of checkpointing so we don't re-run older versions

  log(`Generating API documentation for: ${pc.bold(submodule)}`);
  const submodulePath = path.resolve(scriptDir, submodule);
  const submoduleDocsPath = path.resolve(submodulePath, "docs");
  const outputDocsPath = path.resolve(projectDir, "public_html/docs/api", submodule);
  const typedocJsonPath = path.resolve(submodulePath, "typedoc.json");
  const tsJsonPath = path.resolve(submodulePath, "tsconfig.json");
  const customCssPath = path.resolve(scriptDir, "typedoc-theme.css");
  const customThemePath = path.resolve(scriptDir, "typedoc-theme.cjs");

  // Fetch the current git branch:
  const gitBranch = spawn("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: submodulePath,
    encoding: "utf8",
  }).stdout.trim();
  log(`Current git branch: ${pc.bold(gitBranch)}`);

  // For retro-generating old tags, we need to inject the typedoc and
  // typescript config files into the submodule after every checkout:
  const typedocJson = fs.readFileSync(typedocJsonPath, "utf8");
  const tsJson = fs.readFileSync(tsJsonPath, "utf8");

  // We generate API docs for every published semver tag in the submodule:
  let tags = spawn("git", ["tag", "--list"], {
    cwd: submodulePath,
    encoding: "utf8",
  }).stdout.split("\n")
    .map((tag) => tag.trim())
    .filter((tag) => tag.match(/^\d+\.\d+\.\d+$/));
  if (tags.length) {
    log(`   Found version tags: ${pc.bold(tags.join(", "))}`);
  } else {
    log(`   Found no version tags, defaulting to ${pc.bold("HEAD")}.`);
    tags = ["HEAD"];
  }

  for (const tag of tags) {
    log(`   Generating docs for version: ${pc.bold(tag)}`);
    spawn("git", ["checkout", tag], { cwd: submodulePath });
    spawn("npm", ["install"], { cwd: submodulePath });

    // We need to uninstall any local typedoc versions:
    spawn("npm", ["uninstall", "typedoc"], { cwd: submodulePath });

    // We need to inject various configs for older tags without rigging:
    fs.writeFileSync(typedocJsonPath, typedocJson);
    fs.writeFileSync(tsJsonPath, tsJson);

    try {
      spawn("npx", [
        "typedoc",
        "--skipErrorChecking",
        "--tsconfig", tsJsonPath,
        "--options", typedocJsonPath,
        "--customCss", customCssPath,
        "--plugin", customThemePath,
        "--plugin", "typedoc-plugin-versions",
      ], { cwd: submodulePath });
    } catch (err) {
      log(`   ${pc.red("Failed to generate docs for version:")} ${pc.bold(tag)}`);
      log(`   ${pc.red("Error:")} ${err.message}`);
      process.exit(1);
    }

    try {
      spawn("git", ["checkout", "."], { cwd: submodulePath });
      spawn("git", ["clean", "-f", "typedoc.json", "tsconfig.json"], { cwd: submodulePath });
    } catch { /* not fatal */ }
  }

  // Copy results to the public_html folder:
  spawn("rm", ["-rf", outputDocsPath], { cwd: projectDir });
  spawn("cp", ["-r", submoduleDocsPath, outputDocsPath], { cwd: projectDir });

  // Clean up all changes to the submodule:
  try {
    spawn("git", ["clean", "-fdx"], { cwd: submodulePath });
    spawn("git", ["checkout", "."], { cwd: submodulePath });
    spawn("git", ["checkout", gitBranch], { cwd: submodulePath });
  } catch { /* not fatal */ }
}

log(pc.green("Done!"));
