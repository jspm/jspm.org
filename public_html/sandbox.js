import { LitElement, html, css } from 'lit-element';
import { Buffer } from '@jspm/core/nodelibs/buffer';
import zlib from '@jspm/core/nodelibs/zlib';
import CodeMirror from 'codemirror';
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';
import util from '@jspm/core/nodelibs/util';
import { parse as parseEsm } from 'es-module-lexer';
import { parse } from './lib/script-lexer.js';

class JspmEditor extends LitElement {
  static get properties () {
    return {
      contents: {
        // handle conversion of source to encoding string
        converter: {
          fromAttribute (value) {
            if (!value || value[0] !== '#') return '';
            try {
              return zlib.gunzipSync(Buffer.from(value.slice(1), 'base64')).toString('utf8');
            }
            catch (e) {
              console.error(e);
              return '';
            }
          },
          toAttribute (value) {
            return '#' + zlib.gzipSync(Buffer.from(value)).toString('base64');
          }
        },
        reflect: true
      }
    };
  }
  constructor () {
    super();
    window.addEventListener('popstate', () => {
      if (this.getAttribute('contents') !== location.hash)
        this.setAttribute('contents', location.hash);
    });
  }
  render () {
    return html`
      <link rel="stylesheet" @load=${this.attachCodeMirror} href="https://ga.jspm.io/npm:codemirror@5.58.1/lib/codemirror.css"/>
      <div style="width: 100%; height: 100%;">
        <div class="codemirror"></div>
      </div>
    `;
  }
  updated () {
    if (!this.editor)
      return;
    const pos = this.editor.getCursor();
    let lineDiff = 0;
    if (this.offset) {
      if (pos.line > this.offset.start)
        lineDiff = this.offset.lines;
      this.offset = null;
    }
    const scroll = this.editor.getScrollInfo();
    const bottom = scroll.height - scroll.top;
    this.editor.setValue(this.contents);
    this.editor.setCursor({ line: pos.line + lineDiff, ch: pos.ch });
    if (lineDiff)
      this.editor.scrollTo(scroll.left, this.editor.getScrollInfo().height - bottom);
    window.history.pushState(null, document.title, this.getAttribute('contents'));
    this.editor.focus();
  }
  attachCodeMirror () {
    this.editor = CodeMirror(this.shadowRoot.querySelector('.codemirror'), {
      lineNumbers: true,
      value: this.contents,
      mode: 'htmlmixed',
      scrollbarStyle: 'null',
      tabSize: 2,
      smartIndent: false,
      extraKeys: {
        'Ctrl-S': () => this.dispatchEvent(new CustomEvent('save'))
      }
    });
    window.editor = this.editor;
    this.dispatchEvent(new CustomEvent('load'));
  }

  getContents () {
    const source = this.editor.getValue();
    this.contents = source;
    return source;
  }

  async setContents (contents, offset) {
    this.contents = this.editor.getValue();
    this.offset = offset;
    this.contents = contents;
    await this.updateComplete;
    return contents;
  }

  static get styles () {
    return css`
      .codemirror {
        height: 100%;
      }
      .CodeMirror {
        height: 100%;
      }
    `;
  }
}
customElements.define('jspm-editor', JspmEditor);

class JspmConsole extends LitElement {
  constructor () {
    super();
    this.api = Object.assign(Object.create(null), this.$logWrapper, {
      log: (...args) => {
        let content = '';
        for (let i = 0; i < args.length; i++) {
          content += util.inspect(args[i], { depth: 0 }) + (i < args.length - 1 ? ' ' : '');
        }
        this.log(content.replace(/\\n/g, '\n'));
        // window.console.log.apply(this.$logWrapper, args);
      },
      error: err => {
        let parts = (err && err.stack || err.toString()).split(/blob\:.+/);
        this.log(parts.join('sandbox'), { color: 'red' });
      },
      warn: msg => {
        this.log(msg, { backgroundColor: 'goldenrod' });
      },
      debug: (...args) => {
        this.log(...args);
      },
      info: (...args) => {
        this.log(...args);
      }
    });
  }
  firstUpdated () {
    this.$log = this.shadowRoot.querySelector('.log');
  }
  render () {
    return html`<div class="log"></div>`;
  }
  log (content, style) {
    const newItem = Object.assign(document.createElement('pre'), {
      className: 'item',
      innerHTML: content
    });
    if (style)
      Object.assign(newItem.style, style);
    this.$log.appendChild(newItem);
    this.$log.scrollTop = this.$log.scrollHeight;
  }
  static get styles () {
    return css`
      .log {
        font-size: 1em;
        background-color: #444;
        color: #eee;
        overflow-y: scroll;
        height: 50%;
      }
      .log .item {
        border-bottom: 1px solid #777;
        padding-bottom: 0.5em;
        padding: 0.5em 2em;
        margin: 0;
        white-space: pre-wrap;
      }
    `;
  }
}
customElements.define('jspm-console', JspmConsole);

class JspmSandbox extends LitElement {
  static get properties () {
    return {
      selectedUrl: String,
      running: Boolean
    };
  }
  constructor () {
    super();
    this.examples = Object.create(null);
    this.running = false;
    for (const example of this.children)
      this.examples[example.getAttribute('name')] = example.getAttribute('content');
    
    this.selectedUrl = location.hash || Object.values(this.examples)[0];
  }
  firstUpdated () {
    this.$examples = this.shadowRoot.querySelector('select.examples');
    this.$editor = this.shadowRoot.querySelector('jspm-editor');
    this.$browserWrapper = this.shadowRoot.querySelector('.browser-wrapper');
    this.$console = this.shadowRoot.querySelector('jspm-console');
    function keydown (e) {
      if ((e.key === 'p' || e.key === 'P') && e.ctrlKey) {
        import('./sandboxcmd.js');
        e.preventDefault();
        window.removeEventListener('keydown', keydown);
      }
    }
    window.addEventListener('keydown', keydown);
  }
  async onSelect () {
    this.selectedUrl = this.$examples.value;
    await this.updateComplete;
    this.run();
  }
  render () {
    return html`
      <div class="editor-bar">
        <div class="inner">
          <select class="examples" @change=${this.onSelect}}>
            <option value="">Examples</option>
            ${Object.entries(this.examples).map(([name, url]) => html`<option value="${url}" ?selected=${url === this.selectedUrl}>${name}</option>`)}
          </select>
          <button class="run" @click=${this.run} ?disabled=${this.running}>&#9654;&nbsp;Run</button>
        </div>
      </div>
      <jspm-editor contents="${this.selectedUrl}" @load=${this.run} @save=${this.run}></jspm-editor>
      <div class="output">
        <div style="position: absolute; width: 100%; height: 100%; z-index: 11;">
          <div class="browser-wrapper" style="width:100%; height: 50%; background-color:#fff"></div>
          <jspm-console></jspm-console>
        </div>
      </div>
    `;
  }
  async run () {
    let source = this.$editor.getContents();

    const scripts = parse(source);
    
    const moduleScripts = [];
    let importMap;
    for (const script of scripts) {
      const typeAttr = script.attributes.find(attr => source.slice(attr.nameStart, attr.nameEnd) === 'type');
      if (!typeAttr) continue;
      let typeValue = source.slice(typeAttr.valueStart, typeAttr.valueEnd);
      if (typeValue[0] === '"' || typeValue[0] === '\'')
        typeValue = typeValue.slice(1, -1);
      if (typeValue === 'module')
        moduleScripts.push(script);
      else if (!importMap && typeValue === 'importmap')
        importMap = script;
    }

    let importMapJson;
    if (importMap) {
      try {
        importMapJson = JSON.parse(source.slice(importMap.innerStart, importMap.innerEnd).trim() || '{}');
      }
      catch {}
    }

    if (importMapJson) {
      let addedImports = false;
      if (typeof importMapJson.imports !== 'object')
        importMapJson.imports = {};
      for (const script of moduleScripts) {
        const moduleSource = source.slice(script.innerStart, script.innerEnd);
        try {
          const [imports] = parseEsm(moduleSource);
          for (const impt of imports) {
            if (impt.d === -1) {
              const imptSpecifier = moduleSource.slice(impt.s, impt.e);
              try {
                new URL(imptSpecifier);
                continue;
              }
              catch {}
              if (!importMapJson.imports[imptSpecifier]) {
                addedImports = true;
                importMapJson.imports[imptSpecifier] = 'https://jspm.dev/' + imptSpecifier;
              }
            }
          }
        }
        catch {}
      }

      if (addedImports)
        source = source.slice(0, importMap.innerStart) + '\n' + JSON.stringify(importMapJson, null, 2) + '\n' + source.slice(importMap.innerEnd);
    }

    await this.$editor.setContents(source);

    this.running = true;

    const script = document.createElement('script');
    script.type = 'module';
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
    const needsShim = !source.match(/es-module-shims(\.min)?\.js/);
    const blobUrl = URL.createObjectURL(new Blob([`
      <script>self.esmsInitOptions = { onerror: e=>{window.parent.jspmSandboxError(e.message || e, '', '', '', e)} };</script>
      ${needsShim ? `<script async src="https://ga.jspm.io/npm:es-module-shims@0.10.1/dist/es-module-shims.min.js"><${''}/script>` : ''}
      <script>window.parent.jspmSandboxStarted()<${''}/script>
      ${source}
      <script type="module">window.parent.jspmSandboxFinished()<${''}/script>
      <script>
      window.onerror = function (msg, source, line, col, err) {
        window.parent.jspmSandboxError(msg, source, line, col, err);
      };
      window.console = window.parent.jspmConsole;
      <${''}/script>
    `], { type: 'text/html' }));
    iframe.src = blobUrl;
    this.$browserWrapper.innerHTML = '';
    this.$browserWrapper.appendChild(iframe);

    let started = false;
    window.jspmSandboxStarted = () => started = true;
    window.jspmSandboxFinished = () => {
      if (!started) {
        if (this.running) {
          this.$console.log('Network error loading modules. Check the browser network panel.');
          this.running = false;
          iframe.contentDocument.body.style.cursor = 'default';
        }
      }
      else {
        this.running = false;
        iframe.contentDocument.body.style.cursor = 'default';
      }
    };
    window.jspmSandboxError = (msg, source, line, col, err) => {
      if (this.running) {
        this.running = false;
        iframe.contentDocument.body.style.cursor = 'default';
      }
      let parts = (err.stack || err).split(blobUrl);
      if (parts.length === 1) {
        if (line === 1) col = col - 72;
        parts = [`${msg} sandbox:${line}:${col}`];
      }
      this.$console.log(parts.join('sandbox'), { color: 'red' });
    };
    window.jspmConsole = this.$console.api;
  }
  static get styles () {
    return css`
      jspm-editor {
        position: absolute;
        top: 3.5em;
        left: 0;
        width: 50%;
        height: calc(100% - 3.5em);
      }
      .editor-bar {
        width: 0;
        height: 3em;
        position: absolute;
        top: 0;
        left: 50%;
        z-index: 12;
      }
      .editor-bar .inner {
        width: 12em;
        margin-left: -6em;
        margin-top: 1.2em;
      }
      .editor-bar select {
        float: left;
        width: 8em;
      }
      .editor-bar button {
        float: right;
        padding-left: 1em;
        margin-top: 0.05em;
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
      .output {
        position: absolute;
        top: 3.5em;
        right: 0;
        width: 50%;
        height: calc(100% - 3.5em);
        border-left: 1px solid #eee;
      }
      @media screen and (max-width: 850px), screen and (max-device-width: 850px) {
        jspm-editor {
          width: 100%;
        }
        .output {
          left: 0;
          top: calc(3.5em + 50%);
          height: calc(50% - 3.5em);
          width: 100%;
        }
        .topbar ul.toplinks {
          display: none;
        }
        .editor-bar {
          left: 70%;
        }
      }
    `;
  }
}
customElements.define('jspm-sandbox', JspmSandbox);
