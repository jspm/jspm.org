import { LitElement, html } from 'lit-element';
import CodeMirror from 'codemirror';
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';
import styles from './editor.css' with { type: 'css' };

export class JspmEditor extends LitElement {
  static styles = styles;
  static get properties () {
    return {
      contents: { type: String },
      currentFile: { type: String },
      readOnly: { type: Boolean }
    };
  }
  render () {
    return html`
      <link rel="stylesheet" @load=${this.attachCodeMirror} href="https://ga.jspm.io/npm:codemirror@5.65.19/lib/codemirror.css"/>
      <div style="width: 100%; height: 100%;">
        <div class="codemirror"></div>
      </div>
    `;
  }
  updated (changedProperties) {
    if (!this.editor)
      return;
    
    // Update mode if file changed
    if (changedProperties.has('currentFile') && this.currentFile) {
      const mode = this.getMode(this.currentFile);
      this.editor.setOption('mode', mode);
    }
    
    // Update readOnly if it changed
    if (changedProperties.has('readOnly')) {
      this.editor.setOption('readOnly', this.readOnly);
    }
    
    // Only update editor content if contents actually changed
    if (changedProperties.has('contents')) {
      const pos = this.editor.getCursor();
      let lineDiff = 0;
      if (this.offset) {
        if (pos.line > this.offset.start)
          lineDiff = this.offset.lines;
        this.offset = null;
      }
      const scroll = this.editor.getScrollInfo();
      const bottom = scroll.height - scroll.top;
      
      // Only setValue if the content is actually different
      if (this.editor.getValue() !== this.contents) {
        this.editor.setValue(this.contents || '');
        this.editor.setCursor({ line: pos.line + lineDiff, ch: pos.ch });
        if (lineDiff)
          this.editor.scrollTo(scroll.left, this.editor.getScrollInfo().height - bottom);
      }
    }
    
    this.editor.focus();
  }
  attachCodeMirror () {
    this.editor = CodeMirror(this.shadowRoot.querySelector('.codemirror'), {
      lineNumbers: true,
      value: this.contents || '',
      mode: this.getMode(this.currentFile),
      // scrollbarStyle: 'null',
      tabSize: 2,
      smartIndent: false,
      readOnly: this.readOnly,
      extraKeys: {
        'Ctrl-S': () => !this.readOnly && this.dispatchEvent(new CustomEvent('save'))
      }
    });
    window.editor = this.editor;
    this.editor.on("change", (cm, changeObj) => {
      if (!this.changeEvent)
        this.changeEvent = setTimeout(() => {
          this.changeEvent = null;
          this.dispatchEvent(new CustomEvent('hot'));
        }, 200);
    });
    this.dispatchEvent(new CustomEvent('load'));
  }

  // Method to get the file extension and set appropriate mode
  getMode(filename) {
    if (!filename) return 'htmlmixed';
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js':
      case 'mjs':
        return 'javascript';
      case 'css':
        return 'css';
      case 'html':
      case 'htm':
        return 'htmlmixed';
      default:
        return 'htmlmixed';
    }
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
}
customElements.define('jspm-editor', JspmEditor);
