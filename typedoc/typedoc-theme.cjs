const { JSX } = require("typedoc");
const path = require("path");
const fs = require("fs");
const { JSDOM } = require('jsdom');

const jspmTemplate = fs.readFileSync('../template.html', 'utf8');
const dom = new JSDOM(jspmTemplate);
const sidebarHTML = dom.window.document.querySelector('.sidebar').outerHTML;

module.exports.load = (app) => {
  app.renderer.hooks.on("body.begin", (ctx) => JSX.createElement(
    JSX.Raw,
    {
      html: `
        <div class="topbar">
          <a id="jspm-logo-link" style="display: block" href="/docs">
            <div id="jspm-logo"></div>
            <h1 id="jspm-logo-header">JSPM</h1>
          </a>
        </div>
        ${sidebarHTML}
        <div class="content-container">
          <div class="content">
        `
    }
  ));

  app.renderer.hooks.on("body.end", (ctx) => JSX.createElement(
    JSX.Raw,
    {
      html: `
        </div></div>
        <script>
          // Injects the logo div into the header.
          const logo = document.getElementById("jspm-logo-link");
          const header = document.querySelector("header.tsd-page-toolbar");
          if (!!header) {
            header.prepend(logo);
          }
        </script>
        <link rel="stylesheet" href="/style.css" />
        <link rel="stylesheet" href="/typedoc.css" />
      `,
    },
  ));
}
