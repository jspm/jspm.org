// Injects the logo div into the header.
const logo = document.getElementById("jspm-logo-link");
const header = document.querySelector("header.tsd-page-toolbar");
if (!!header) {
  header.prepend(logo);
}
