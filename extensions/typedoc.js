Chomp.registerTemplate('typedoc-generator', function (task) {
  let {
    lib,
    out,
    plugins = ''
  } = task.templateOptions;

  plugins = plugins.split(',');

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
      ...plugins.filter(plugin => plugin.startsWith('./')).map(plugin => plugin.slice(2))
    ],
    cwd: lib,
    run: `
      typedoc --skipErrorChecking \
        --tsconfig tsconfig.json \
        --options typedoc.json \
        ${plugins.map(plugin => plugin.startsWith('./') ? `--plugin ${backtrack}${plugin.slice(2)}` : `--plugin ${plugin}`).join(' ')} \
        --out ${backtrack}${out}
    `
  }];
});
