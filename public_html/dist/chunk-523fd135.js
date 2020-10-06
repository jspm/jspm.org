System.register(['lit-element','buffer','zlib','codemirror','codemirror/mode/css/css.js','codemirror/mode/javascript/javascript.js','codemirror/mode/xml/xml.js','codemirror/mode/htmlmixed/htmlmixed.js','util','es-module-lexer'],function(exports,module){'use strict';var LitElement,html,css,Buffer,zlib,CodeMirror,util,parse$1;return{setters:[function(module){LitElement=module.LitElement;html=module.html;css=module.css;},function(module){Buffer=module.Buffer;},function(module){zlib=module.default;},function(module){CodeMirror=module.default;},function(){},function(){},function(){},function(){},function(module){util=module.default;},function(module){parse$1=module.parse;}],execute:function(){exports('p',parse);let source,i;function parse(t){const r=[];source=t,i=0;let e={start:-1,end:-1,attributes:void 0,innerStart:-1,innerEnd:-1};for(;i<source.length;){for(;60!==source.charCodeAt(i++);)if(i===source.length)return r;switch(i=i,readTagName()){case"!--":for(;45!==source.charCodeAt(i)||45!==source.charCodeAt(i+1)||62!==source.charCodeAt(i+2);)if(++i===source.length)return r;i+=3;break;case"script":e.start=i-8;const t=[];let n;for(;n=scanAttr();)t.push(n);for(e.attributes=t,e.innerStart=i;;){for(;60!==source.charCodeAt(i++);)if(i===source.length)return r;const t=readTagName();if(void 0===t)return r;if("/script"===t){for(e.innerEnd=i-8;scanAttr(););e.end=i;break}}r.push(e),e={start:-1,end:-1,attributes:void 0,innerStart:-1,innerEnd:-1};break;case void 0:return r;default:for(;scanAttr(););}}return r}function readTagName(){let t,r=i;for(;!isWs(t=source.charCodeAt(i++))&&62!==t;)if(i===source.length)return;return source.slice(r,62===t?--i:i-1)}function scanAttr(){let t;for(;isWs(t=source.charCodeAt(i));)if(++i===source.length)return;if(62===t)return void i++;const r=i;for(;!isWs(t=source.charCodeAt(i++))&&61!==t;){if(i===source.length)return;if(62===t)return {nameStart:r,nameEnd:--i,valueStart:-1,valueEnd:-1}}const e=i-1;if(61!==t){for(;isWs(t=source.charCodeAt(i))&&61!==t;){if(++i===source.length)return;if(62===t)return}if(61!==t)return {nameStart:r,nameEnd:e,valueStart:-1,valueEnd:-1}}for(;isWs(t=source.charCodeAt(i++));){if(i===source.length)return;if(62===t)return}if(34===t){const t=i;for(;34!==source.charCodeAt(i++);)if(i===source.length)return;return {nameStart:r,nameEnd:e,valueStart:t,valueEnd:i-1}}if(39===t){const t=i;for(;39!==source.charCodeAt(i++);)if(i===source.length)return;return {nameStart:r,nameEnd:e,valueStart:t,valueEnd:i-1}}{const n=i-1;for(i++;!isWs(t=source.charCodeAt(i))&&62!==t;)if(++i===source.length)return;return {nameStart:r,nameEnd:e,valueStart:n,valueEnd:i}}}function isWs(t){return 32===t||t<14&&t>8}if("undefined"!=typeof process&&process.mainModule===module){require("path");const t=require("assert");console.group("Simple script");{const r='\n      <script type="module">test<\/script>\n      <script src="hi" jspm-preload><\/script>\n    ',e=parse(r);t.strictEqual(e.length,2),t.strictEqual(e[0].attributes.length,1);const n=e[0].attributes[0];t.strictEqual(r.slice(n.nameStart,n.nameEnd),"type"),t.strictEqual(r.slice(n.valueStart,n.valueEnd),"module"),t.strictEqual(e[0].innerStart,29),t.strictEqual(e[0].innerEnd,33),t.strictEqual(e[0].start,7),t.strictEqual(e[0].end,42),t.strictEqual(e[1].start,49),t.strictEqual(e[1].end,88),t.strictEqual(e[1].attributes.length,2);}console.groupEnd(),console.group("Edge cases");{const r="\n    \x3c!-- <script>\n      \x3c!-- /* <\/script> */ ->\n      console.log('hmm');\n    </script\n    \n    <script>\n      console.log('hi');\n    <\/script>\n    \n    \n    --\x3e\n    \n    <script ta\"    ==='s'\\>\n      console.log('test');\n    <\/script>\n    \n    <script \x3c!-- <p type=\"module\">\n      export var p = 5;\n      console.log('hi');\n    <\/script type=\"test\"\n    >\n    \n    \n\n    ",e=parse(r);t.strictEqual(e.length,2),t.strictEqual(e[0].attributes.length,1);let n=e[0].attributes[0];t.strictEqual(r.slice(n.nameStart,n.nameEnd),'ta"'),t.strictEqual(r.slice(n.valueStart,n.valueEnd),"==='s'\\"),t.strictEqual(e[0].innerStart,195),t.strictEqual(e[0].innerEnd,227),t.strictEqual(e[0].start,172),t.strictEqual(e[0].end,236),t.strictEqual(e[1].attributes.length,3),n=e[1].attributes[0],t.strictEqual(r.slice(n.nameStart,n.nameEnd),"\x3c!--"),t.strictEqual(n.valueStart,-1),t.strictEqual(n.valueEnd,-1),n=e[1].attributes[1],t.strictEqual(r.slice(n.nameStart,n.nameEnd),"<p"),t.strictEqual(n.valueStart,-1),t.strictEqual(n.valueEnd,-1),n=e[1].attributes[2],t.strictEqual(r.slice(n.nameStart,n.nameEnd),"type"),t.strictEqual(r.slice(n.valueStart,n.valueEnd),"module"),t.strictEqual(e[1].innerStart,276),t.strictEqual(e[1].innerEnd,331),t.strictEqual(e[1].start,246),t.strictEqual(e[1].end,356);}console.groupEnd();}class JspmEditor extends LitElement{static get properties(){return {contents:{converter:{fromAttribute(t){if(!t||"#"!==t[0])return "";try{return zlib.gunzipSync(Buffer.from(t.slice(1),"base64")).toString("utf8")}catch(t){return console.error(t),""}},toAttribute:t=>"#"+zlib.gzipSync(Buffer.from(t)).toString("base64")},reflect:!0}}}constructor(){super(),window.addEventListener("popstate",(()=>{this.getAttribute("contents")!==location.hash&&this.setAttribute("contents",location.hash);}));}render(){return html`
      <link rel="stylesheet" @load=${this.attachCodeMirror} href="https://ga.system.jspm.io/npm:codemirror@5.58.1/lib/codemirror.css"/>
      <div style="width: 100%; height: 100%;">
        <div class="codemirror"></div>
      </div>
    `}updated(){if(!this.editor)return;const t=this.editor.getCursor();let e=0;this.offset&&(t.line>this.offset.start&&(e=this.offset.lines),this.offset=null);const o=this.editor.getScrollInfo(),s=o.height-o.top;this.editor.setValue(this.contents),this.editor.setCursor({line:t.line+e,ch:t.ch}),e&&this.editor.scrollTo(o.left,this.editor.getScrollInfo().height-s),window.history.pushState(null,document.title,this.getAttribute("contents")),this.editor.focus();}attachCodeMirror(){this.editor=CodeMirror(this.shadowRoot.querySelector(".codemirror"),{lineNumbers:!0,value:this.contents,mode:"htmlmixed",scrollbarStyle:"null",tabSize:2,smartIndent:!1,extraKeys:{"Ctrl-S":()=>this.dispatchEvent(new CustomEvent("save"))}}),window.editor=this.editor,this.dispatchEvent(new CustomEvent("load"));}getContents(){const t=this.editor.getValue();return this.contents=t,t}async setContents(t,e){return this.contents=this.editor.getValue(),this.offset=e,this.contents=t,await this.updateComplete,t}static get styles(){return css`
      .codemirror {
        height: 100%;
      }
      .CodeMirror {
        height: 100%;
      }
    `}}customElements.define("jspm-editor",JspmEditor);class JspmConsole extends LitElement{constructor(){super(),this.api=Object.assign(Object.create(null),this.$logWrapper,{log:(...t)=>{let e="";for(let o=0;o<t.length;o++)e+=util.inspect(t[o],{depth:0})+(o<t.length-1?" ":"");this.log(e.replace(/\\n/g,"\n"));},error:t=>{let e=(t&&t.stack||t.toString()).split(/blob\:.+/);this.log(e.join("sandbox"),{color:"red"});},warn:t=>{this.log(t,{backgroundColor:"goldenrod"});}});}firstUpdated(){this.$log=this.shadowRoot.querySelector(".log");}render(){return html`<div class="log"></div>`}log(t,e){const o=Object.assign(document.createElement("pre"),{className:"item",innerHTML:t});e&&Object.assign(o.style,e),this.$log.appendChild(o),this.$log.scrollTop=this.$log.scrollHeight;}static get styles(){return css`
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
    `}}customElements.define("jspm-console",JspmConsole);class JspmSandbox extends LitElement{static get properties(){return {selectedUrl:String,running:Boolean}}constructor(){super(),this.examples=Object.create(null),this.running=!1;for(const t of this.children)this.examples[t.getAttribute("name")]=t.getAttribute("content");this.selectedUrl=location.hash||Object.values(this.examples)[0];}firstUpdated(){this.$examples=this.shadowRoot.querySelector("select.examples"),this.$editor=this.shadowRoot.querySelector("jspm-editor"),this.$browserWrapper=this.shadowRoot.querySelector(".browser-wrapper"),this.$console=this.shadowRoot.querySelector("jspm-console"),window.addEventListener("keydown",(function t(e){"p"!==e.key&&"P"!==e.key||!e.ctrlKey||(module.import('./chunk-6c9efc6f.js'),e.preventDefault(),window.removeEventListener("keydown",t));}));}async onSelect(){this.selectedUrl=this.$examples.value,await this.updateComplete,this.run();}render(){return html`
      <div class="editor-bar">
        <div class="inner">
          <select class="examples" @change=${this.onSelect}}>
            <option value="">Examples</option>
            ${Object.entries(this.examples).map((([t,e])=>html`<option value="${e}" ?selected=${e===this.selectedUrl}>${t}</option>`))}
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
    `}async run(){let t=this.$editor.getContents();const e=parse(t),o=[];let s,r;for(const r of e){const e=r.attributes.find((e=>"type"===t.slice(e.nameStart,e.nameEnd)));let i=t.slice(e.valueStart,e.valueEnd);'"'!==i[0]&&"'"!==i[0]||(i=i.slice(1,-1)),"module"===i?o.push(r):s||"importmap"!==i||(s=r);}if(s)try{r=JSON.parse(t.slice(s.innerStart,s.innerEnd).trim()||"{}");}catch{}if(r){let e=!1;"object"!=typeof r.imports&&(r.imports={});for(const s of o){const o=t.slice(s.innerStart,s.innerEnd);try{const[t]=parse$1(o);for(const s of t)if(-1===s.d){const t=o.slice(s.s,s.e);try{new URL(t);continue}catch{}r.imports[t]||(e=!0,r.imports[t]="https://jspm.dev/"+t);}}catch{}}e&&(t=t.slice(0,s.innerStart)+"\n"+JSON.stringify(r,null,2)+"\n"+t.slice(s.innerEnd));}await this.$editor.setContents(t),this.running=!0;document.createElement("script").type="module";const i=document.createElement("iframe");Object.assign(i.style,{margin:"0",padding:"0",borderStyle:"none",height:"100%",width:"100%",marginBottom:"-5px",overflow:"scroll"});const n=URL.createObjectURL(new Blob([`\n      ${t.replace(/type=["']?(module|importmap)['"]?/g,"type=$1-shim")}\n      <script type="module" src="https://ga.jspm.io/npm:es-module-shims@0.7.0/dist/es-module-shims.js"><\/script>\n      <script>window.parent.jspmSandboxStarted()<\/script>\n      <script type="module">importShim.onerror=e=>{window.parent.jspmSandboxError(e.message || e, '', '', '', e)}<\/script>\n      <script type="module-shim">window.parent.jspmSandboxFinished()<\/script>\n      <script>\n      window.onerror = function (msg, source, line, col, err) {\n        window.parent.jspmSandboxError(msg, source, line, col, err);\n      };\n      window.console = window.parent.jspmConsole;\n      <\/script>\n    `],{type:"text/html"}));i.src=n,this.$browserWrapper.innerHTML="",this.$browserWrapper.appendChild(i);let l=!1;window.jspmSandboxStarted=()=>l=!0,window.jspmSandboxFinished=()=>{l?(this.running=!1,i.contentDocument.body.style.cursor="default"):this.running&&(this.$console.log("Network error loading modules. Check the browser network panel."),this.running=!1,i.contentDocument.body.style.cursor="default");},window.jspmSandboxError=(t,e,o,s,r)=>{this.running&&(this.running=!1,i.contentDocument.body.style.cursor="default");let l=(r.stack||r).split(n);1===l.length&&(1===o&&(s-=72),l=[`${t} sandbox:${o}:${s}`]),this.$console.log(l.join("sandbox"),{color:"red"});},window.jspmConsole=this.$console.api;}static get styles(){return css`
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
    `}}customElements.define("jspm-sandbox",JspmSandbox);}}});