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
assuming your project folder structure is like this:
```
ProjectFolder
|
|__node_modules
|  |__pejvak
|  |__jquery
|
|__view
|  |__home.pejvakhtml
|  |__rendercode.pejvakhtml
|  |__main.template
|
|__www
|  |__static.html
|  |__...
|
|__index.js
|__package-lock.json
|__package.json
```
### example project files:
`pejvak constructor` has 3 parameters.
* settings
* routes
* virtualPaths
### settings (1st parameter)
the structure should be something like this:
```js
const settings = {
  www: "./www",  //main www folder where you should place static files(html,css,local js files, images, ...)
  view: "./view",  //view folder containing `.template` and `.pejvakhtml` files
  port: 80,    //http port number
  renderFileExtension: ".pejvakhtml",    //default pejvak rendering file extension (usually: ".pejvakhtml")
  forbidenExtensions: [".pejvakhtml", ".pem"],  //all forbidden file extensions from direct http requests
  https: {  //in case of using https
    port: 443,  //https secure port
    keyFile: "./key.pem",  //https key file location path
    certFile: "./cert.pem"  //https certificate file location path
  }
}
```
### routes (2nd parameter)
you can set some static routes when you don't need to run a block of code to render. for example assume that you have a static `rendercode` page and a simple `static html`. then you can set the routing path for them at the initialize point of pejvak server:
```js
const routes = {
  "/rendercode": { file: "/rendercode.pejvakhtml", template: "/main.template" },
  "/static": { file: "/static.html" },
};
```
### virtualPaths (3d parameter)
here you can bind any unique path to access to the desired module folder. virtual paths makes the module files accessible through web:
```js
const vritualpaths = {
  "/js/jquery": "node_modules/jquery/dist",
}
```
complete index.js file should be like this:
```js
/** index.js */
import pejvak from "pejvak"

const settings = {
  www: "./www",
  view: "./view",
  port: 80,
  renderFileExtension: ".pejvakhtml",
  forbidenExtensions: [".pejvakhtml"],
};
const routes = {
  "/rendercode": { file: "/rendercode.pejvakhtml", template: "/main.template" },
  "/static": { file: "/static.html" },
};
const vritualpaths = {
  "/js/jquery": "node_modules/jquery/dist",
};

let srv = new pejvak(settings, routes, vritualpaths);

srv.handle("GET", "/", (req, res) => {
  res.render("home.pejvakhtml", "main.template", { user: "rick", role: "admin" });
});

srv.handle("POST", "/gettime", (req, res) => {
  res.send(new Date().toLocaleTimeString()).end();
});

srv.start();
```
```html
<!-- main.template -->
<!doctype html>
<html>

<head>
  <meta charset="utf-8">
  <title>{@title}</title>
  <style>
    body { padding: 10px; }
    .menu { margin: 5px; border: 1px solid #555; border-radius: 5px; padding: 10px; font-size: 1.5em; }
  </style>
  {@head}
</head>

<body>
  <a class="menu" href="/">Home</a>
  <a class="menu" href="/rendercode">render code</a>
  <a class="menu" href="/static">static</a>
  {@content}
  {@script}
</body>

</html>
```
```html
<!-- home.pejvakhtml -->
@part:title {home page} part:title;
@part:head
{
  <style>
    span { color: red; }
  </style>
} part:head;

@part:content
{
  <h2>home page is rendered with model data</h2>
  <h3>the user <span>${model.user}</span> has role <span>${model.role}</span></h3>
  <button onclick="gettime()">get server time</button>
  <span id="time"></span>
} part:content;

@part:script
{
  <script>
    function gettime() {
      $.ajax({
        type: "POST",
        url: "/gettime",
      }).done(function (data) {
        $("#time").html(data);
      });
    }
  </script>
  <!-- consider using of "/js/jquery/..." has been defined as a virtual path before -->
  <script src="/js/jquery/jquery.min.js"></script>
} part:script;
```
```html
<!-- rendercode.pejvakhtml -->
@part:title {rendercode page} part:title;
@part:head
{
<style>
  body { background-color: rgb(83, 158, 163); }
  * { color: white; border-color: white !important; }
  span { font-size: 2em; }
</style>
} part:head;

@part:content
{
  <h2>the matrix is filled with server side js rendering code</h2>
  @for(var i = 1; i < 5; i++) {
    <span style="color: yellow"> ${i} </span>
    @for(var j = 1; j < 10; j++) {
      <span style="color: aqua"> ${j} </span>
    @}
   <br/>
  @}
} part:content;
```
probably you have noticed some `{@partname}` tag style in the above code. this format is used in the template designing feature of pejvak and will be explained later ([Template structure](#template-structure)).

also `@` char at the beginning of lines (other than parts) means that the js code is going to render at the server side.
## Template structure
in a `.template` file you can define dynamic parts in the format of `{@partname}`. you can choose any desired name. 
```html
...
<head>
  {@name}
</head>
...
```

parts are replaced with the given value during the rendering process. then inside `.pejvakhtml` files you can define contents of each part separately in the following format:
```html
@part:name {
  ...(content)...
} part:name;
```
## Rendering javascript codes
you can use any javascript code inside `.pejvakhtml` files which is going to run during the rendering process. to do so, just add the `@` at the beginning of the line.
```html
@for(var i = 1; i < 5; i++) {
  <span>${i}</span>
@}
```
## Docs
coming soon
