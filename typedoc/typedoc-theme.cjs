const { JSX } = require("typedoc");
const path = require("path");
const fs = require("fs");

module.exports.load = (app) => {
  app.renderer.hooks.on("body.end", (ctx) => JSX.createElement(
    JSX.Raw,
    {
      html: `
        <script>
          // Injects the logo div into the header.
          const logo = document.getElementById("jspm-logo-link");
          const header = document.querySelector("header.tsd-page-toolbar");
          if (!!header) {
            header.prepend(logo);
          }
        </script>
        <link rel="stylesheet" href="/typedoc.css" />
      `,
    },
  ));

  app.renderer.hooks.on("body.begin", (ctx) => JSX.createElement(
    "a",
    { id: "jspm-logo-link", display: "block", href: "/docs" },
    [
      JSX.createElement("div", { id: "jspm-logo" }),
      JSX.createElement("h1", { id: "jspm-logo-header" }, "jspm"),
    ],
  ));
}
