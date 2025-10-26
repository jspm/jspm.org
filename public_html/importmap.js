(map => {
  const mapUrl = document.currentScript.src;
  const resolve = imports => Object.fromEntries(Object.entries(imports ).map(([k, v]) => [k, new URL(v, mapUrl).href]));
  document.head.appendChild(Object.assign(document.createElement("script"), {
    type: "importmap",
    innerHTML: JSON.stringify({
      imports: resolve(map.imports),
      scopes: Object.fromEntries(Object.entries(map.scopes).map(([k, v]) => [new URL(k, mapUrl).href, resolve(v)]))
    })
  }));
})
({
  "imports": {
    "jspm/sandbox": "./lib/sandbox.js"
  },
  "scopes": {
    "./": {
      "@jspm/core/nodelibs/buffer": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/buffer.js",
      "@jspm/core/nodelibs/util": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/util.js",
      "@jspm/core/nodelibs/zlib": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/zlib.js",
      "@jspm/generator": "https://ga.jspm.io/npm:@jspm/generator@2.7.5/dist/generator.js",
      "codemirror": "https://ga.jspm.io/npm:codemirror@5.59.4/lib/codemirror.js",
      "codemirror/mode/css/css.js": "https://ga.jspm.io/npm:codemirror@5.59.4/mode/css/css.js",
      "codemirror/mode/htmlmixed/htmlmixed.js": "https://ga.jspm.io/npm:codemirror@5.59.4/mode/htmlmixed/htmlmixed.js",
      "codemirror/mode/javascript/javascript.js": "https://ga.jspm.io/npm:codemirror@5.59.4/mode/javascript/javascript.js",
      "codemirror/mode/xml/xml.js": "https://ga.jspm.io/npm:codemirror@5.59.4/mode/xml/xml.js",
      "jszip": "https://ga.jspm.io/npm:jszip@3.10.1/lib/index.js",
      "lit-element": "https://ga.jspm.io/npm:lit-element@4.2.1/development/index.js"
    },
    "https://ga.jspm.io/npm:@ampproject/remapping@2.3.0/": {
      "@jridgewell/gen-mapping": "https://ga.jspm.io/npm:@jridgewell/gen-mapping@0.3.13/dist/gen-mapping.umd.js",
      "@jridgewell/trace-mapping": "https://ga.jspm.io/npm:@jridgewell/trace-mapping@0.3.31/dist/trace-mapping.umd.js"
    },
    "https://ga.jspm.io/npm:@babel/code-frame@7.27.1/": {
      "@babel/helper-validator-identifier": "https://ga.jspm.io/npm:@babel/helper-validator-identifier@7.27.1/lib/index.js",
      "js-tokens": "https://ga.jspm.io/npm:js-tokens@4.0.0/index.js",
      "picocolors": "https://ga.jspm.io/npm:picocolors@1.1.1/picocolors.browser.js",
      "process": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/process.js"
    },
    "https://ga.jspm.io/npm:@babel/core@7.26.10/": {
      "#lib/config/files/index.js": "https://ga.jspm.io/npm:@babel/core@7.26.10/lib/config/files/index-browser.js",
      "#lib/config/resolve-targets.js": "https://ga.jspm.io/npm:@babel/core@7.26.10/lib/config/resolve-targets-browser.js",
      "#lib/transform-file.js": "https://ga.jspm.io/npm:@babel/core@7.26.10/lib/transform-file-browser.js",
      "@ampproject/remapping": "https://ga.jspm.io/npm:@ampproject/remapping@2.3.0/dist/remapping.umd.js",
      "@babel/code-frame": "https://ga.jspm.io/npm:@babel/code-frame@7.27.1/lib/index.js",
      "@babel/generator": "https://ga.jspm.io/npm:@babel/generator@7.28.3/lib/index.js",
      "@babel/helper-compilation-targets": "https://ga.jspm.io/npm:@babel/helper-compilation-targets@7.27.2/lib/index.js",
      "@babel/helper-module-transforms": "https://ga.jspm.io/npm:@babel/helper-module-transforms@7.28.3/lib/index.js",
      "@babel/helpers": "https://ga.jspm.io/npm:@babel/helpers@7.28.4/lib/index.js",
      "@babel/parser": "https://ga.jspm.io/npm:@babel/parser@7.28.4/lib/index.js",
      "@babel/template": "https://ga.jspm.io/npm:@babel/template@7.27.2/lib/index.js",
      "@babel/traverse": "https://ga.jspm.io/npm:@babel/traverse@7.28.4/lib/index.js",
      "@babel/types": "https://ga.jspm.io/npm:@babel/types@7.28.4/lib/index.js",
      "convert-source-map": "https://ga.jspm.io/npm:convert-source-map@2.0.0/index.js",
      "debug": "https://ga.jspm.io/npm:debug@4.4.3/src/browser.js",
      "fs": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/fs.js",
      "gensync": "https://ga.jspm.io/npm:gensync@1.0.0-beta.2/index.js",
      "path": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/path.js",
      "process": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/process.js",
      "semver": "https://ga.jspm.io/npm:semver@6.3.1/semver.js"
    },
    "https://ga.jspm.io/npm:@babel/generator@7.28.3/": {
      "@babel/types": "https://ga.jspm.io/npm:@babel/types@7.28.4/lib/index.js",
      "@jridgewell/gen-mapping": "https://ga.jspm.io/npm:@jridgewell/gen-mapping@0.3.13/dist/gen-mapping.umd.js",
      "@jridgewell/trace-mapping": "https://ga.jspm.io/npm:@jridgewell/trace-mapping@0.3.31/dist/trace-mapping.umd.js",
      "jsesc": "https://ga.jspm.io/npm:jsesc@3.1.0/jsesc.js"
    },
    "https://ga.jspm.io/npm:@babel/helper-annotate-as-pure@7.27.3/": {
      "@babel/types": "https://ga.jspm.io/npm:@babel/types@7.28.4/lib/index.js"
    },
    "https://ga.jspm.io/npm:@babel/helper-compilation-targets@7.27.2/": {
      "@babel/compat-data/native-modules": "https://ga.jspm.io/npm:@babel/compat-data@7.28.4/native-modules.js",
      "@babel/compat-data/plugins": "https://ga.jspm.io/npm:@babel/compat-data@7.28.4/plugins.js",
      "@babel/helper-validator-option": "https://ga.jspm.io/npm:@babel/helper-validator-option@7.27.1/lib/index.js",
      "browserslist": "https://ga.jspm.io/npm:browserslist@4.26.3/index.js",
      "lru-cache": "https://ga.jspm.io/npm:lru-cache@5.1.1/index.js",
      "process": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/process.js",
      "semver": "https://ga.jspm.io/npm:semver@6.3.1/semver.js"
    },
    "https://ga.jspm.io/npm:@babel/helper-create-class-features-plugin@7.28.3/": {
      "@babel/core": "https://ga.jspm.io/npm:@babel/core@7.26.10/lib/dev.index.js",
      "@babel/helper-annotate-as-pure": "https://ga.jspm.io/npm:@babel/helper-annotate-as-pure@7.27.3/lib/index.js",
      "@babel/helper-member-expression-to-functions": "https://ga.jspm.io/npm:@babel/helper-member-expression-to-functions@7.27.1/lib/index.js",
      "@babel/helper-optimise-call-expression": "https://ga.jspm.io/npm:@babel/helper-optimise-call-expression@7.27.1/lib/index.js",
      "@babel/helper-replace-supers": "https://ga.jspm.io/npm:@babel/helper-replace-supers@7.27.1/lib/index.js",
      "@babel/helper-skip-transparent-expression-wrappers": "https://ga.jspm.io/npm:@babel/helper-skip-transparent-expression-wrappers@7.27.1/lib/index.js",
      "@babel/traverse": "https://ga.jspm.io/npm:@babel/traverse@7.28.4/lib/index.js",
      "semver": "https://ga.jspm.io/npm:semver@6.3.1/semver.js"
    },
    "https://ga.jspm.io/npm:@babel/helper-member-expression-to-functions@7.27.1/": {
      "@babel/types": "https://ga.jspm.io/npm:@babel/types@7.28.4/lib/index.js"
    },
    "https://ga.jspm.io/npm:@babel/helper-module-imports@7.27.1/": {
      "@babel/types": "https://ga.jspm.io/npm:@babel/types@7.28.4/lib/index.js",
      "assert": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/assert.js"
    },
    "https://ga.jspm.io/npm:@babel/helper-module-transforms@7.28.3/": {
      "@babel/core": "https://ga.jspm.io/npm:@babel/core@7.26.10/lib/dev.index.js",
      "@babel/helper-module-imports": "https://ga.jspm.io/npm:@babel/helper-module-imports@7.27.1/lib/index.js",
      "@babel/helper-validator-identifier": "https://ga.jspm.io/npm:@babel/helper-validator-identifier@7.27.1/lib/index.js",
      "@babel/traverse": "https://ga.jspm.io/npm:@babel/traverse@7.28.4/lib/index.js",
      "assert": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/assert.js",
      "path": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/path.js"
    },
    "https://ga.jspm.io/npm:@babel/helper-optimise-call-expression@7.27.1/": {
      "@babel/types": "https://ga.jspm.io/npm:@babel/types@7.28.4/lib/index.js"
    },
    "https://ga.jspm.io/npm:@babel/helper-replace-supers@7.27.1/": {
      "@babel/core": "https://ga.jspm.io/npm:@babel/core@7.26.10/lib/dev.index.js",
      "@babel/helper-member-expression-to-functions": "https://ga.jspm.io/npm:@babel/helper-member-expression-to-functions@7.27.1/lib/index.js",
      "@babel/helper-optimise-call-expression": "https://ga.jspm.io/npm:@babel/helper-optimise-call-expression@7.27.1/lib/index.js",
      "@babel/traverse": "https://ga.jspm.io/npm:@babel/traverse@7.28.4/lib/index.js"
    },
    "https://ga.jspm.io/npm:@babel/helper-skip-transparent-expression-wrappers@7.27.1/": {
      "@babel/types": "https://ga.jspm.io/npm:@babel/types@7.28.4/lib/index.js"
    },
    "https://ga.jspm.io/npm:@babel/helpers@7.28.4/": {
      "@babel/template": "https://ga.jspm.io/npm:@babel/template@7.27.2/lib/index.js",
      "@babel/types": "https://ga.jspm.io/npm:@babel/types@7.28.4/lib/index.js"
    },
    "https://ga.jspm.io/npm:@babel/plugin-syntax-import-attributes@7.27.1/": {
      "@babel/helper-plugin-utils": "https://ga.jspm.io/npm:@babel/helper-plugin-utils@7.27.1/lib/index.js"
    },
    "https://ga.jspm.io/npm:@babel/plugin-syntax-jsx@7.27.1/": {
      "@babel/helper-plugin-utils": "https://ga.jspm.io/npm:@babel/helper-plugin-utils@7.27.1/lib/index.js"
    },
    "https://ga.jspm.io/npm:@babel/plugin-syntax-typescript@7.27.1/": {
      "@babel/helper-plugin-utils": "https://ga.jspm.io/npm:@babel/helper-plugin-utils@7.27.1/lib/index.js"
    },
    "https://ga.jspm.io/npm:@babel/plugin-transform-modules-commonjs@7.27.1/": {
      "@babel/core": "https://ga.jspm.io/npm:@babel/core@7.26.10/lib/dev.index.js",
      "@babel/helper-module-transforms": "https://ga.jspm.io/npm:@babel/helper-module-transforms@7.28.3/lib/index.js",
      "@babel/helper-plugin-utils": "https://ga.jspm.io/npm:@babel/helper-plugin-utils@7.27.1/lib/index.js"
    },
    "https://ga.jspm.io/npm:@babel/plugin-transform-typescript@7.28.0/": {
      "@babel/core": "https://ga.jspm.io/npm:@babel/core@7.26.10/lib/dev.index.js",
      "@babel/helper-annotate-as-pure": "https://ga.jspm.io/npm:@babel/helper-annotate-as-pure@7.27.3/lib/index.js",
      "@babel/helper-create-class-features-plugin": "https://ga.jspm.io/npm:@babel/helper-create-class-features-plugin@7.28.3/lib/index.js",
      "@babel/helper-plugin-utils": "https://ga.jspm.io/npm:@babel/helper-plugin-utils@7.27.1/lib/index.js",
      "@babel/helper-skip-transparent-expression-wrappers": "https://ga.jspm.io/npm:@babel/helper-skip-transparent-expression-wrappers@7.27.1/lib/index.js",
      "@babel/plugin-syntax-typescript": "https://ga.jspm.io/npm:@babel/plugin-syntax-typescript@7.27.1/lib/index.js",
      "assert": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/assert.js"
    },
    "https://ga.jspm.io/npm:@babel/preset-typescript@7.27.1/": {
      "@babel/helper-plugin-utils": "https://ga.jspm.io/npm:@babel/helper-plugin-utils@7.27.1/lib/index.js",
      "@babel/helper-validator-option": "https://ga.jspm.io/npm:@babel/helper-validator-option@7.27.1/lib/index.js",
      "@babel/plugin-syntax-jsx": "https://ga.jspm.io/npm:@babel/plugin-syntax-jsx@7.27.1/lib/index.js",
      "@babel/plugin-transform-modules-commonjs": "https://ga.jspm.io/npm:@babel/plugin-transform-modules-commonjs@7.27.1/lib/index.js",
      "@babel/plugin-transform-typescript": "https://ga.jspm.io/npm:@babel/plugin-transform-typescript@7.28.0/lib/index.js"
    },
    "https://ga.jspm.io/npm:@babel/template@7.27.2/": {
      "@babel/code-frame": "https://ga.jspm.io/npm:@babel/code-frame@7.27.1/lib/index.js",
      "@babel/parser": "https://ga.jspm.io/npm:@babel/parser@7.28.4/lib/index.js",
      "@babel/types": "https://ga.jspm.io/npm:@babel/types@7.28.4/lib/index.js"
    },
    "https://ga.jspm.io/npm:@babel/traverse@7.28.4/": {
      "@babel/code-frame": "https://ga.jspm.io/npm:@babel/code-frame@7.27.1/lib/index.js",
      "@babel/generator": "https://ga.jspm.io/npm:@babel/generator@7.28.3/lib/index.js",
      "@babel/helper-globals/data/builtin-lower.json": "https://ga.jspm.io/npm:@babel/helper-globals@7.28.0/data/builtin-lower.json.js",
      "@babel/helper-globals/data/builtin-upper.json": "https://ga.jspm.io/npm:@babel/helper-globals@7.28.0/data/builtin-upper.json.js",
      "@babel/parser": "https://ga.jspm.io/npm:@babel/parser@7.28.4/lib/index.js",
      "@babel/template": "https://ga.jspm.io/npm:@babel/template@7.27.2/lib/index.js",
      "@babel/types": "https://ga.jspm.io/npm:@babel/types@7.28.4/lib/index.js",
      "debug": "https://ga.jspm.io/npm:debug@4.4.3/src/browser.js"
    },
    "https://ga.jspm.io/npm:@babel/types@7.28.4/": {
      "@babel/helper-string-parser": "https://ga.jspm.io/npm:@babel/helper-string-parser@7.27.1/lib/index.js",
      "@babel/helper-validator-identifier": "https://ga.jspm.io/npm:@babel/helper-validator-identifier@7.27.1/lib/index.js",
      "process": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/process.js"
    },
    "https://ga.jspm.io/npm:@jridgewell/gen-mapping@0.3.13/": {
      "@jridgewell/sourcemap-codec": "https://ga.jspm.io/npm:@jridgewell/sourcemap-codec@1.5.5/dist/sourcemap-codec.umd.js",
      "@jridgewell/trace-mapping": "https://ga.jspm.io/npm:@jridgewell/trace-mapping@0.3.31/dist/trace-mapping.umd.js"
    },
    "https://ga.jspm.io/npm:@jridgewell/sourcemap-codec@1.5.5/": {
      "buffer": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/buffer.js"
    },
    "https://ga.jspm.io/npm:@jridgewell/trace-mapping@0.3.31/": {
      "@jridgewell/resolve-uri": "https://ga.jspm.io/npm:@jridgewell/resolve-uri@3.1.2/dist/resolve-uri.umd.js",
      "@jridgewell/sourcemap-codec": "https://ga.jspm.io/npm:@jridgewell/sourcemap-codec@1.5.5/dist/sourcemap-codec.umd.js"
    },
    "https://ga.jspm.io/npm:@jspm/generator@2.7.5/": {
      "#fetch": "https://ga.jspm.io/npm:@jspm/generator@2.7.5/dist/fetch-native.js",
      "@babel/core": "https://ga.jspm.io/npm:@babel/core@7.26.10/lib/dev.index.js",
      "@babel/plugin-syntax-import-attributes": "https://ga.jspm.io/npm:@babel/plugin-syntax-import-attributes@7.27.1/lib/index.js",
      "@babel/preset-typescript": "https://ga.jspm.io/npm:@babel/preset-typescript@7.27.1/lib/index.js",
      "@jspm/import-map": "https://ga.jspm.io/npm:@jspm/import-map@1.2.2/dist/map.js",
      "es-module-lexer": "https://ga.jspm.io/npm:es-module-lexer@1.7.0/dist/lexer.js",
      "es-module-lexer/js": "https://ga.jspm.io/npm:es-module-lexer@1.7.0/dist/lexer.asm.js",
      "fs": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/fs.js",
      "minimatch": "https://ga.jspm.io/npm:minimatch@10.0.2/dist/esm/index.js",
      "pako": "https://ga.jspm.io/npm:pako@2.1.0/dist/pako.esm.mjs",
      "sver": "https://ga.jspm.io/npm:sver@1.8.4/sver.js",
      "sver/convert-range.js": "https://ga.jspm.io/npm:sver@1.8.4/convert-range.js",
      "tar-stream": "https://ga.jspm.io/npm:tar-stream@3.1.7/index.js",
      "url": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/url.js"
    },
    "https://ga.jspm.io/npm:baseline-browser-mapping@2.8.16/": {
      "process": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/process.js"
    },
    "https://ga.jspm.io/npm:brace-expansion@4.0.1/": {
      "balanced-match": "https://ga.jspm.io/npm:balanced-match@3.0.1/index.js"
    },
    "https://ga.jspm.io/npm:browserslist@4.26.3/": {
      "#node.js": "https://ga.jspm.io/npm:browserslist@4.26.3/browser.js",
      "baseline-browser-mapping": "https://ga.jspm.io/npm:baseline-browser-mapping@2.8.16/dist/index.cjs",
      "caniuse-lite/dist/unpacker/agents": "https://ga.jspm.io/npm:caniuse-lite@1.0.30001750/dist/unpacker/agents.js",
      "electron-to-chromium/versions": "https://ga.jspm.io/npm:electron-to-chromium@1.5.234/versions.js",
      "node-releases/data/processed/envs.json": "https://ga.jspm.io/npm:node-releases@2.0.23/data/processed/envs.json.js",
      "node-releases/data/release-schedule/release-schedule.json": "https://ga.jspm.io/npm:node-releases@2.0.23/data/release-schedule/release-schedule.json.js",
      "path": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/path.js"
    },
    "https://ga.jspm.io/npm:convert-source-map@2.0.0/": {
      "buffer": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/buffer.js"
    },
    "https://ga.jspm.io/npm:core-util-is@1.0.3/": {
      "buffer": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/buffer.js"
    },
    "https://ga.jspm.io/npm:debug@4.4.3/": {
      "ms": "https://ga.jspm.io/npm:ms@2.1.3/index.js",
      "process": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/process.js"
    },
    "https://ga.jspm.io/npm:events-universal@1.0.1/": {
      "events": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/events.js"
    },
    "https://ga.jspm.io/npm:jsesc@3.1.0/": {
      "buffer": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/buffer.js"
    },
    "https://ga.jspm.io/npm:jszip@3.10.1/": {
      "buffer": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/buffer.js",
      "lie": "https://ga.jspm.io/npm:lie@3.3.0/lib/browser.js",
      "pako": "https://ga.jspm.io/npm:pako@1.0.11/index.js",
      "process": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/process.js",
      "readable-stream": "https://ga.jspm.io/npm:readable-stream@2.3.8/readable-browser.js",
      "setimmediate": "https://ga.jspm.io/npm:setimmediate@1.0.5/setImmediate.js"
    },
    "https://ga.jspm.io/npm:lie@3.3.0/": {
      "immediate": "https://ga.jspm.io/npm:immediate@3.0.6/lib/browser.js"
    },
    "https://ga.jspm.io/npm:lit-element@4.2.1/": {
      "@lit/reactive-element": "https://ga.jspm.io/npm:@lit/reactive-element@2.1.1/development/reactive-element.js",
      "lit-html": "https://ga.jspm.io/npm:lit-html@3.3.1/development/lit-html.js"
    },
    "https://ga.jspm.io/npm:lru-cache@5.1.1/": {
      "yallist": "https://ga.jspm.io/npm:yallist@3.1.1/yallist.js"
    },
    "https://ga.jspm.io/npm:minimatch@10.0.2/": {
      "brace-expansion": "https://ga.jspm.io/npm:brace-expansion@4.0.1/index.js"
    },
    "https://ga.jspm.io/npm:process-nextick-args@2.0.1/": {
      "process": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/process.js"
    },
    "https://ga.jspm.io/npm:readable-stream@2.3.8/": {
      "#lib/internal/streams/stream.js": "https://ga.jspm.io/npm:readable-stream@2.3.8/lib/internal/streams/stream-browser.js",
      "core-util-is": "https://ga.jspm.io/npm:core-util-is@1.0.3/lib/util.js",
      "events": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/events.js",
      "inherits": "https://ga.jspm.io/npm:inherits@2.0.4/inherits_browser.js",
      "isarray": "https://ga.jspm.io/npm:isarray@1.0.0/index.js",
      "process": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/process.js",
      "process-nextick-args": "https://ga.jspm.io/npm:process-nextick-args@2.0.1/index.js",
      "safe-buffer": "https://ga.jspm.io/npm:safe-buffer@5.1.2/index.js",
      "string_decoder": "https://ga.jspm.io/npm:string_decoder@1.1.1/lib/string_decoder.js",
      "util": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/util.js",
      "util-deprecate": "https://ga.jspm.io/npm:util-deprecate@1.0.2/browser.js"
    },
    "https://ga.jspm.io/npm:safe-buffer@5.1.2/": {
      "buffer": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/buffer.js"
    },
    "https://ga.jspm.io/npm:semver@6.3.1/": {
      "process": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/process.js"
    },
    "https://ga.jspm.io/npm:setimmediate@1.0.5/": {
      "process": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/process.js"
    },
    "https://ga.jspm.io/npm:streamx@2.23.0/": {
      "events-universal": "https://ga.jspm.io/npm:events-universal@1.0.1/default.js",
      "fast-fifo": "https://ga.jspm.io/npm:fast-fifo@1.3.2/index.js",
      "text-decoder": "https://ga.jspm.io/npm:text-decoder@1.2.2/index.js"
    },
    "https://ga.jspm.io/npm:string_decoder@1.1.1/": {
      "safe-buffer": "https://ga.jspm.io/npm:safe-buffer@5.1.2/index.js"
    },
    "https://ga.jspm.io/npm:sver@1.8.4/": {
      "semver": "https://ga.jspm.io/npm:semver@6.3.1/semver.js"
    },
    "https://ga.jspm.io/npm:tar-stream@3.1.7/": {
      "b4a": "https://ga.jspm.io/npm:b4a@1.7.3/browser.js",
      "fast-fifo": "https://ga.jspm.io/npm:fast-fifo@1.3.2/index.js",
      "fs": "https://ga.jspm.io/npm:@jspm/core@2.1.0/nodelibs/browser/fs.js",
      "streamx": "https://ga.jspm.io/npm:streamx@2.23.0/index.js"
    },
    "https://ga.jspm.io/npm:text-decoder@1.2.2/": {
      "#lib/pass-through-decoder.js": "https://ga.jspm.io/npm:text-decoder@1.2.2/lib/browser-decoder.js",
      "#lib/utf8-decoder.js": "https://ga.jspm.io/npm:text-decoder@1.2.2/lib/browser-decoder.js"
    }
  }
});
