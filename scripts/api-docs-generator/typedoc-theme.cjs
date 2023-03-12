const { JSX } = require("typedoc");
const path = require("path");
const fs = require("fs");

const inject = fs.readFileSync(
  path.resolve(__dirname, "typedoc-theme-inject.js"));

module.exports.load = (app) => {
  app.renderer.hooks.on("body.end", (ctx) => JSX.createElement(
    JSX.Raw,
    {
      html: `<script>${inject}</script>`,
    },
  ));

  app.renderer.hooks.on("body.begin", (ctx) => JSX.createElement(
    "a",
    { id: "jspm-logo-link", display: "block", href: "/" },
    [
      JSX.createElement("div", { id: "jspm-logo" }),
      JSX.createElement("h1", { id: "jspm-logo-header" }, "jspm"),
    ],
  ));
}
