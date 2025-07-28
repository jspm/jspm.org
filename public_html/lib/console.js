import { LitElement, html } from 'lit-element';
import util from '@jspm/core/nodelibs/util';
import styles from './console.css' with { type: 'css' };

export class JspmConsole extends LitElement {
  static styles = styles;
  constructor () {
    super();
    this.timers = {};
    this.counts = {};
    this.api = Object.assign(Object.create(null), {
      log: (...args) => {
        let content = '';
        for (let i = 0; i < args.length; i++) {
          content += util.inspect(args[i], { depth: 0 }) + (i < args.length - 1 ? ' ' : '');
        }
        this.log(content.replace(/\\n/g, '\n'));
      },
      error: (...args) => {
        let content = '';
        for (let i = 0; i < args.length; i++) {
          const arg = args[i];
          if (arg && arg.stack) {
            let parts = arg.stack.split(/blob\:.+/);
            content += parts.join('sandbox');
          } else {
            content += util.inspect(arg, { depth: 0 });
          }
          content += (i < args.length - 1 ? ' ' : '');
        }
        this.log(content, { color: 'red' });
      },
      warn: (...args) => {
        let content = '';
        for (let i = 0; i < args.length; i++) {
          content += util.inspect(args[i], { depth: 0 }) + (i < args.length - 1 ? ' ' : '');
        }
        this.log(content, { backgroundColor: 'goldenrod' });
      },
      debug: (...args) => {
        let content = '';
        for (let i = 0; i < args.length; i++) {
          content += util.inspect(args[i], { depth: 0 }) + (i < args.length - 1 ? ' ' : '');
        }
        this.log(content);
      },
      info: (...args) => {
        let content = '';
        for (let i = 0; i < args.length; i++) {
          content += util.inspect(args[i], { depth: 0 }) + (i < args.length - 1 ? ' ' : '');
        }
        this.log(content);
      },
      // Add other console methods for compatibility
      trace: (...args) => {
        let content = 'Trace: ';
        for (let i = 0; i < args.length; i++) {
          content += util.inspect(args[i], { depth: 0 }) + (i < args.length - 1 ? ' ' : '');
        }
        this.log(content);
      },
      assert: (condition, ...args) => {
        if (!condition) {
          let content = 'Assertion failed: ';
          for (let i = 0; i < args.length; i++) {
            content += util.inspect(args[i], { depth: 0 }) + (i < args.length - 1 ? ' ' : '');
          }
          this.log(content, { color: 'red' });
        }
      },
      clear: () => {
        if (this.$log) {
          this.$log.innerHTML = '';
        }
      },
      count: (label = 'default') => {
        this.counts[label] = (this.counts[label] || 0) + 1;
        this.log(`${label}: ${this.counts[label]}`);
      },
      countReset: (label = 'default') => {
        this.counts[label] = 0;
      },
      group: (...args) => {
        if (args.length > 0) {
          let content = '▼ ';
          for (let i = 0; i < args.length; i++) {
            content += util.inspect(args[i], { depth: 0 }) + (i < args.length - 1 ? ' ' : '');
          }
          this.log(content);
        }
      },
      groupCollapsed: (...args) => {
        if (args.length > 0) {
          let content = '▶ ';
          for (let i = 0; i < args.length; i++) {
            content += util.inspect(args[i], { depth: 0 }) + (i < args.length - 1 ? ' ' : '');
          }
          this.log(content);
        }
      },
      groupEnd: () => {
        // Just add a blank line for now
        this.log('');
      },
      time: (label = 'default') => {
        this.timers[label] = performance.now();
      },
      timeEnd: (label = 'default') => {
        if (this.timers[label]) {
          const duration = performance.now() - this.timers[label];
          this.log(`${label}: ${duration.toFixed(3)}ms`);
          delete this.timers[label];
        }
      },
      timeLog: (label = 'default', ...args) => {
        if (this.timers[label]) {
          const duration = performance.now() - this.timers[label];
          let content = `${label}: ${duration.toFixed(3)}ms`;
          if (args.length > 0) {
            content += ' ';
            for (let i = 0; i < args.length; i++) {
              content += util.inspect(args[i], { depth: 0 }) + (i < args.length - 1 ? ' ' : '');
            }
          }
          this.log(content);
        }
      },
      dir: (obj) => {
        this.log(util.inspect(obj, { depth: 2 }));
      },
      dirxml: (obj) => {
        this.log(util.inspect(obj, { depth: 2 }));
      },
      table: (data) => {
        // Simple table representation
        this.log(util.inspect(data, { depth: 2 }));
      }
    });
  }
  firstUpdated () {
    this.$log = this.shadowRoot.querySelector('.log');
  }
  render () {
    return html`<div class="log"></div>`;
  }
  clear () {
    if (this.$log)
      this.$log.innerHTML = '';
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
}

customElements.define('jspm-console', JspmConsole);
