Chomp.registerTemplate('typedoc-generator', function (task) {
  const {
    lib,
    out,
    plugin
  } = task.templateOptions;

  const envVersion = `${lib.toUpperCase().replace(/-/g, '_')}_VERSION`;

  if (!lib)
    throw new Error(`Must provide a "lib" path to build with TypeDoc`);
  if (!out)
    throw new Error(`Must provide an "out" path to build documentation into`);
  if (!ENV[envVersion])
    throw new Error(`Must provide a ${envVersion} env var to the typedoc generator, matching the package.json version of the project being built`);

  const libLen = lib.split('/').length;
  const backtrack = '../'.repeat(libLen);

  return [{
    name: task.name,
    target: `${out}/v${ENV[envVersion]}`,
    deps: [
      `${lib}/src/**/*.ts`,
      `${lib}/package.json`,
      `${lib}/typedoc.json`,
      `${lib}/tsconfig.json`,
      ...plugin ? [plugin] : [],
    ],
    cwd: lib,
    run: `
      typedoc --skipErrorChecking \
        --tsconfig tsconfig.json \
        --options typedoc.json \
        ${plugin ? `--plugin ${backtrack}${plugin}` : ''} \
        --plugin typedoc-plugin-versions \
        --out ${backtrack}${out}
    `
  }];
});
