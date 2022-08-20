pejvak is a fast web framework with minimum dependencies and small size for [Node.js](https://nodejs.org/). it has an embeded template rendering engine. I have just created `pejvak` for my personal projects in the first place.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing pejvak, [install node.js](https://nodejs.org/en/download/).

first create a `package.json` with
the [`npm init` command](https://docs.npmjs.com/creating-a-package-json-file).

then use [`npm install`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```console
$ npm install pejvak
```
# How to use
## Example 1
```js
import pejvak from "pejvak"

let srv = new pejvak({ port: 80 });

srv.handle("GET", "/", (req, res) => {
  res.send("This is a GET method");
});

srv.start();
```
## Example 2
`pejvak constructor` has 3 parameters.
* settings
* routes
* virtualPaths

assuming your project folder structure is like this:
```
ProjectFolder
|
|__node_modules
|  |__pejvak
|
|__view
|  |__about.pejvakhtml
|  |__main.template
|
|__www
|  |__static.html
|
|__index.js
|__package-lock.json
|__package.json
```

then `settings` parameter structure should be something like this:
```js
const settings = {
  www: "./www",  //main www folder where you should place static files(html,css,local js files, images, ...)
  view: "./view",  //view folder containing `.template` and `.pejvakhtml` files
  port: 80,    //http port number
  renderFileExtension: "pejvakhtml",    //default pejvak rendering file extension (usually: "pejvakhtml")
  forbidenExtensions: [".pejvakhtml", ".pem"],  //all forbidden file extensions from direct http requests
  https: {  //in case of using https
    port: 443,  //https secure port
    keyFile: "./key.pem",  //https key file location path
    certFile: "./cert.pem"  //https certificate file location path
  }
}
```
`routes` parameter is where you can set some static routes when you don't need to run a block of code to render. for example assume that you have a static `about` page and a simple `static html`. then you can set the routing path for them at the initialize point of pejvak server:
```js
const routes = {
  "/about": { file: "/about.pejvakhtml", template: "/main.template" },
  "/static": { file: "/static.html" },
};
```

`virtualPaths` is where you can set some access paths to installed packages inside `node_modules` folder such as bootstrap or jquery or anything else. the usage is simple:
```js
const vritualpaths = {
  "/css/bootstrap": "node_modules/bootstrap/dist/css",
  "/js/bootstrap": "node_modules/bootstrap/dist/js",
  "/js/jquery": "node_modules/jquery/dist",
}
```
so the complete index.js file should be something like:
```js
import pejvak from "pejvak"

const settings = {
  www: "./www",
  view: "./view",
  port: 80,
  renderFileExtension: ".pejvakhtml",
  forbidenExtensions: [".pejvakhtml"],
};
const routes = {
  "/about": { file: "/about.pejvakhtml", template: "/main.template" },
  "/static": { file: "/static.html" },
};
const vritualpaths = {
  "/css/bootstrap": "node_modules/bootstrap/dist/css",
  "/js/bootstrap": "node_modules/bootstrap/dist/js",
  "/js/jquery": "node_modules/jquery/dist",
};

let srv = new pejvak(settings, routes, vritualpaths);

srv.handle("GET", "/", (req, res) => {
  res.render("home.pejvakhtml", "main.template");
});

srv.start();
```
## Docs & Community
coming soon