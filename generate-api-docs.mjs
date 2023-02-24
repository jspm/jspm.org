import { spawnSync } from 'child_process';
import * as path from "path";

const submodules = [
  "generator", // @jspm/generator
];

for (const submodule of submodules) {
  console.log(`Generating API documentation for: ${submodule}`);
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  const submodulePath = path.resolve(currentDir, `api_repos/${submodule}`);
  const typedocJsonPath = path.resolve(submodulePath, "typedoc.json");
  const tsJsonPath = path.resolve(submodulePath, "tsconfig.json");

  // First run "npm install" in the submodule:
  console.log("   Installing dependencies...");
  const installResult = spawnSync("npm", ["install"], {
    cwd: submodulePath,
    stdio: "inherit",
  });
  if (installResult.status !== 0) {
    console.error(installResult.error);
    process.exit(1);
  }

  // Then we run typedoc to generate the API docs:
  console.log("   Generating API documentation...");
  const typedocResult = spawnSync("npx", [
    "typedoc",
    "--tsconfig", tsJsonPath,
    "--options", typedocJsonPath,
  ], {
    cwd: submodulePath,
    stdio: "inherit",
  });
  if (typedocResult.status !== 0) {
    console.error(typedocResult.error);
    process.exit(1);
  }

  // Next, we copy the generated documentation to the public_html/api folder:
  console.log("   Copying generated documentation...");
  const copyResult = spawnSync("cp", [
    "-r",
    path.resolve(submodulePath, "docs"),
    path.resolve(currentDir, "public_html", "api", submodule),
  ], {
    stdio: "inherit",
  });
  if (copyResult.status !== 0) {
    console.error(copyResult.error);
    process.exit(1);
  }

  // Finally, reset the submodule hard:
  console.log("   Resetting submodule...");
  const resetResult = spawnSync("rm", [
    "-r",
    "docs",
  ], {
    cwd: submodulePath,
    stdio: "inherit",
  });
  if (resetResult.status !== 0) {
    console.error(resetResult.error);
    process.exit(1);
  }
}

console.log("Done!");
