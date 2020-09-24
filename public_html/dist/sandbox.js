System.register(['lit-element','buffer','zlib','codemirror','codemirror/mode/css/css.js','codemirror/mode/javascript/javascript.js','codemirror/mode/xml/xml.js','codemirror/mode/htmlmixed/htmlmixed.js','util'],function(){'use strict';var LitElement,html,css,Buffer,zlib,CodeMirror,util;return{setters:[function(module){LitElement=module.LitElement;html=module.html;css=module.css;},function(module){Buffer=module.Buffer;},function(module){zlib=module.default;},function(module){CodeMirror=module.default;},function(){},function(){},function(){},function(){},function(module){util=module.default;}],execute:function(){class JspmEditor extends LitElement{static get properties(){return {contents:{converter:{fromAttribute(t){if(!t||"#"!==t[0])return "";try{return zlib.gunzipSync(Buffer.from(t.slice(1),"base64")).toString("utf8")}catch(t){return console.error(t),""}},toAttribute:t=>"#"+zlib.gzipSync(Buffer.from(t)).toString("base64")},reflect:!0}}}constructor(){super();}render(){return html`
      <link rel="stylesheet" @load=${this.attachCodeMirror} href="https://ga.system.jspm.io/npm:codemirror@5.58.1/lib/codemirror.css"/>
      <div style="width: 100%; height: 100%;">
        <div class="codemirror"></div>
      </div>
    `}updated(){this.editor&&this.editor.getValue()!==this.contents&&this.editor.setValue(this.contents);}attachCodeMirror(){this.editor=CodeMirror(this.shadowRoot.querySelector(".codemirror"),{lineNumbers:!0,value:this.contents,mode:"htmlmixed",scrollbarStyle:"null",tabSize:2,extraKeys:{"Ctrl-S":()=>this.dispatchEvent(new CustomEvent("save"))}}),window.editor=this.editor,this.dispatchEvent(new CustomEvent("load"));}async getContents(){const t=this.editor.getValue();return this.contents=t,await this.updateComplete,t}static get styles(){return css`
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
    `}}customElements.define("jspm-console",JspmConsole);class JspmSandbox extends LitElement{static get properties(){return {selectedUrl:String,running:Boolean}}constructor(){super(),this.examples=Object.create(null),this.running=!1;for(const t of this.children)this.examples[t.getAttribute("name")]=t.getAttribute("content");this.selectedUrl=location.hash||Object.values(this.examples)[0];}firstUpdated(){this.$examples=this.shadowRoot.querySelector("select.examples"),this.$editor=this.shadowRoot.querySelector("jspm-editor"),this.$browserWrapper=this.shadowRoot.querySelector(".browser-wrapper"),this.$console=this.shadowRoot.querySelector("jspm-console"),window.addEventListener("popstate",()=>{this.$editor.getAttribute("contents")!==location.hash&&this.$editor.setAttribute("contents",location.hash);});}async onSelect(){this.selectedUrl=this.$examples.value,await this.updateComplete,this.run();}render(){return html`
      <div class="editor-bar">
        <div class="inner">
          <select class="examples" @change=${this.onSelect}}>
            <option value="">Examples</option>
            ${Object.entries(this.examples).map(([t,e])=>html`<option value="${e}" ?selected=${e===this.selectedUrl}>${t}</option>`)}
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
    `}async run(){const t=await this.$editor.getContents();location.hash!==this.$editor.getAttribute("contents")&&window.history.pushState(null,document.title,this.$editor.getAttribute("contents")),this.running=!0;document.createElement("script").type="module";const e=document.createElement("iframe");Object.assign(e.style,{margin:"0",padding:"0",borderStyle:"none",height:"100%",width:"100%",marginBottom:"-5px",overflow:"scroll"});const o=URL.createObjectURL(new Blob([`\n      ${t.replace(/type=["']?(module|importmap)['"]?/g,"type=$1-shim")}\n      <script type="module" src="https://ga.jspm.io/npm:es-module-shims@0.6.0/dist/es-module-shims.js"><\/script>\n      <script>window.parent.jspmSandboxStarted()<\/script>\n      <script type="module-shim">window.parent.jspmSandboxFinished()<\/script>\n      <script>\n      window.onerror = function (msg, source, line, col, err) {\n        window.parent.jspmSandboxError(msg, source, line, col, err);\n      };\n      window.console = window.parent.jspmConsole;\n      <\/script>\n    `],{type:"text/html"}));e.src=o,this.$browserWrapper.innerHTML="",this.$browserWrapper.appendChild(e);let r=!1;window.jspmSandboxStarted=()=>r=!0,window.jspmSandboxFinished=()=>{r?(this.running=!1,e.contentDocument.body.style.cursor="default"):this.running&&(this.$console.log("Network error loading modules. Check the browser network panel."),this.running=!1,e.contentDocument.body.style.cursor="default");},window.jspmSandboxError=(t,r,s,i,n)=>{this.running&&(this.running=!1,e.contentDocument.body.style.cursor="default");let l=n.stack.split(o);1===l.length&&(1===s&&(i-=72),l=[`${t} sandbox:${s}:${i}`]),this.$console.log(l.join("sandbox"),{color:"red"});},window.jspmConsole=this.$console.api;}static get styles(){return css`
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