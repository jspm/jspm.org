(map => {
  const mapUrl = document.currentScript.src;
  const resolve = imports => Object.fromEntries(Object.entries(imports ).map(([k, v]) => [k, new URL(v, mapUrl).href]));
  document.head.appendChild(Object.assign(document.createElement("script"), {
    type: "importmap",
    innerHTML: JSON.stringify({
      imports: map.imports,
      scopes: Object.fromEntries(Object.entries(map.scopes).map(([k, v]) => [new URL(k, mapUrl).href, resolve(v)]))
    })
  }));
})
({
  "scopes": {
    "./": {
      "codemirror/mode/": "https://ga.jspm.io/npm:codemirror@5.59.4/mode/"
    },
    "https://ga.jspm.io/": {
      "#fetch": "https://ga.jspm.io/npm:@jspm/generator@2.6.2/dist/fetch-native.js",
      "#lib/config/files/index.js": "https://ga.jspm.io/npm:@babel/core@7.26.10/lib/config/files/index-browser.js",
      "#lib/config/resolve-targets.js": "https://ga.jspm.io/npm:@babel/core@7.26.10/lib/config/resolve-targets-browser.js",
      "#lib/internal/streams/stream.js": "https://ga.jspm.io/npm:readable-stream@2.3.8/lib/internal/streams/stream-browser.js",
      "#lib/pass-through-decoder.js": "https://ga.jspm.io/npm:text-decoder@1.2.2/lib/browser-decoder.js",
      "#lib/transform-file.js": "https://ga.jspm.io/npm:@babel/core@7.26.10/lib/transform-file-browser.js",
      "#lib/utf8-decoder.js": "https://ga.jspm.io/npm:text-decoder@1.2.2/lib/browser-decoder.js",
      "#node.js": "https://ga.jspm.io/npm:browserslist@4.25.0/browser.js"
    }
  }
});
