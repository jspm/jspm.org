const { JSX } = require("typedoc");
const path = require("path");
const fs = require("fs");
const { JSDOM } = require('jsdom');

const jspmTemplate = fs.readFileSync('../template.html', 'utf8');
const dom = new JSDOM(jspmTemplate);
const sidebarHTML = dom.window.document.querySelector('.sidebar').outerHTML;
const topbarHTML = dom.window.document.querySelector('.topbar').outerHTML;

module.exports.load = (app) => {
  app.renderer.hooks.on("head.begin", () => {
    return JSX.createElement("script", null,
      JSX.createElement(JSX.Raw, { html: "localStorage.setItem('tsd-theme', 'light')" }));
  });

  app.renderer.hooks.on("head.end", (ctx) => JSX.createElement(
    JSX.Raw,
    {
      html: `
        <link rel="stylesheet" href="/style.css" />
        <link rel="stylesheet" href="/typedoc.css" />
      `
    }
  ));

  app.renderer.hooks.on("body.begin", (ctx) => JSX.createElement(
    JSX.Raw,
    {
      html: `
        ${topbarHTML}
        <div class="mobile-menu"></div>
        ${sidebarHTML}
        <div class="content-container">
          <div class="content">
        `
    }
  ));

  app.renderer.hooks.on("body.end", (ctx) => JSX.createElement(
    JSX.Raw,
    {
      html: `</div></div><script src="/script.js"></script>`,
    },
  ));
}
