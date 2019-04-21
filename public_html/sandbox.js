import { html, render } from 'lit-html';
import CodeMirror from 'codemirror';
import util from 'util';
import { Buffer } from 'buffer';
import 'codemirror/mode/javascript/javascript.js';
import zlib from 'zlib';

// Disabled: No dynamic import() support in jshint!?
// import jshint from 'jshint';
// import 'codemirror/addon/lint/lint.js';
// import 'codemirror/addon/lint/javascript-lint.js';
// window.JSHINT = jshint.JSHINT;

const defaultContents = `/*
* jspm Sandbox
*
* This sandbox executes ES modules with just the following HTML:
* 
* <!doctype html>
* <script type="module">
*   ...this editor code...
* </script>
* <body>
*   <div id="container"></div>
*   <div id="canvas"></div>
* </body>
* 
* That's all it does!
*/
`;

const sandboxTpl = () => html`
<style>
  @media screen and (max-width: 750px), screen and (max-device-width: 750px) {
    .editor {
      display: none;
    }
  }
  .CodeMirror {
    background: transparent;
    height: 100%;
  }
  .editor-bar {
    height: 3em;
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 12;
  }
  .editor-bar button {
    width: 6em;
    margin-left: -3em;
    margin-top: 1.5em;
    z-index: 13;
    cursor: pointer;
    color: #666;
    text-shadow: 1px 1px #efefef;
    background: transparent;
    border: none;
    outline: none;
  }
  .editor-bar button:hover {
    color: #222;
    text-shadow-color: #fff;
  }
  .editor-bar button[disabled] {
    cursor: wait;
    color: #aaa;
  }
  .output .log .item {
    border-bottom: 1px solid #777;
    padding-bottom: 0.5em;
    padding: 0.5em 2em;
    margin: 0;
    white-space: pre-wrap;
  }
</style>
<div class="editor-bar">
  <button class="run">&#9654;&nbsp;Run</button>
</div>
<div class="editor" style="position: absolute; top: 3.5em; left: 0; width: 50%; height: calc(100% - 3.5em);">
  <div style="width: 100%; height: 100%;">
    <div class="codemirror" style="height: 100%;"></div>
  </div>
</div>
<div class="output" style="position: absolute; top: 3.5em; right: 0; width: 50%; height: calc(100% - 3.5em); border-left: 1px solid #eee;">
  <div style="position: absolute; width: 100%; height: 100%; z-index: 11;">
    <div class="browser-wrapper" style="width:100%; height: 70%; background-color:#fff"></div>
    <div class="log" style="font-size: 1em; background-color: #444; color: #eee; overflow-y: scroll; height: 30%;"></div>
  </div>
</div>
`;

let editor, sandbox, curHash, curJs;
function initSandbox (contents) {
  if (!contents) {
    const hash = window.location.hash.slice(1);
    if (hash) {
      curHash = hash;
      try {
        contents = zlib.gunzipSync(new Buffer(hash, 'base64')).toString('utf8');
      }
      catch (e) {
        console.error(e);
        contents = defaultContents;
      }
    }
    else {
      contents = defaultContents;
    }
  }
  sandbox = document.createElement('div');
  sandbox.className = 'sandbox';
  render(sandboxTpl(), sandbox);
  
  const container = document.body.querySelector('.container');
  container.appendChild(sandbox);

  editor = CodeMirror(sandbox.querySelector('.codemirror'), {
    lineNumbers: true,
    value: contents,
    mode: "javascript",
    // gutters: ["CodeMirror-lint-markers"],
    // lint: {
    //  esversion: '8'
    // }
    scrollbarStyle: 'null',
    tabSize: 2,
  });

  const browserWrapper = sandbox.querySelector('.browser-wrapper');
  const logWrapper = sandbox.querySelector('.log');

  window.addEventListener('popstate', function () {
    const hash = document.location.hash.slice(1);
    if (hash && hash !== curHash) {
      editor.setValue(curJs = zlib.gunzipSync(new Buffer(hash, 'base64')).toString('utf8'));
      curHash = hash;
    }
  });

  function run () {
    let loading = true;
    button.disabled = true;

    const script = document.createElement('script');
    script.type = 'module';
    const js = editor.getValue();

    if (curJs !== js)
      window.history.pushState(null, document.title, '#' + (curHash = zlib.gzipSync(new Buffer(js)).toString('base64')));

    curJs = js;

    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, {
      margin: '0',
      padding: '0',
      borderStyle: 'none',
      height: '100%',
      width: '100%',
      marginBottom: '-5px', // no idea, but it works
      overflow: 'scroll'
    });
    const blobUrl = URL.createObjectURL(new Blob([
`<!doctype html><style>body{cursor:wait}</style><script type="module">window.parent.jspmSandboxStarted();${js.replace(/<\/script>/g, '&lt;\/script>')/*UNSAFE!!*/}
</script>
<script type="module">
window.parent.jspmSandboxFinished();
</script>
<script>
window.onerror = function (msg, source, line, col, err) {
  window.parent.jspmSandboxError(msg, source, line, col, err);
};
window.console = window.parent.jspmConsole;
</script>
<body style="margin: 0; padding: 0; height: 100%; background-color: #fff">
  <canvas id="canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" touch-action="none"></canvas>
  <div id="container"></div>
</body>
`], { type: 'text/html' }));
    iframe.src = blobUrl;
    browserWrapper.innerHTML = '';
    browserWrapper.appendChild(iframe);

    let started = false;
    window.jspmSandboxStarted = function () {
      started = true;
    };
    window.jspmSandboxFinished = function () {
      if (!started) {
        if (loading) {
          jspmLog('Network error loading modules. Check the browser network panel.');
        }
      }
      else {
        loading = false;
        button.disabled = false;
        iframe.contentDocument.body.style.cursor = 'default';
      }
    };
    window.jspmSandboxError = function (msg, source, line, col, err) {
      if (loading) {
        loading = false;
        button.disabled = false;
        iframe.contentDocument.body.style.cursor = 'default';
      }
      let parts = err.stack.split(blobUrl);
      if (parts.length === 1) {
        if (line === 1) col = col - 72;
        parts = [`${msg} sandbox:${line}:${col}`];
      }
      jspmLog(parts.join('sandbox'), { color: 'red' });
    };
    // TODO: support the rest of the console API
    window.jspmConsole = Object.assign(Object.create(null), logWrapper, {
      log (arg) {
        let content = '';
        for (let i = 0; i < arguments.length; i++) {
          content += util.inspect(arguments[i], { depth: 0 }) + (i < arguments.length - 1 ? ' ' : '');
        }
        jspmLog(content.replace(/\\n/g, '\n'));
        window.console.log.apply(logWrapper, arguments);
      },
      error (err) {
        let parts = (err && err.stack || err.toString()).split(blobUrl);
        jspmLog(parts.join('sandbox'), { color: 'red' });
      }
    });
    function jspmLog (content, style) {
      const newItem = document.createElement('pre');
      if (style)
        Object.assign(newItem.style, style);
      newItem.className = 'item';
      newItem.innerHTML = content;
      logWrapper.appendChild(newItem);
      logWrapper.scrollTop = logWrapper.scrollHeight;
    }
  }

  const button = sandbox.querySelector('button.run');
  button.addEventListener('click', run);
  window.jspmLog = function (content) {
    logWrapper.innerHTML += '<pre class="item">' + content.replace(/</g, '&lt;') + '</pre>';
  };

  if (curHash)
    run();
}

initSandbox();
