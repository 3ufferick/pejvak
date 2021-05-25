const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

class pejvak {
    server = undefined;
    settings = undefined;
    // routes = undefined;
    handlers = { "GET": {}, "POST": {} };
    constructor(settings, routes) {
        this.settings = settings;
        // this.routes = routes;
        for (const addr in routes) {
            // console.log("r", r, routes[r]);
            this.handlers["GET"][addr] = routes[addr];
        }
    }
    start() {
        this.server = http.createServer((req, res) => {
            // console.log("req", req);
            this.handleRequests(req, res);
        }).listen(this.settings.port, () => {
            console.log("server started on port", this.settings.port);
        });
    }
    handleRequests(request, response) {
        var pathName = url.parse(request.url).pathname;
        // console.log("handlers", this.handlers);
        console.log(`url: ${request.url}\npath: ${pathName}\n`);
        var h = this.handlers[request.method][pathName];
        if (h && typeof h == "function")
            h(request, response);
        else if (h && typeof h == "string")
            this.loadFile(path.normalize(this.settings.www + h), response);
        else
            this.loadFile(path.normalize(this.settings.www + pathName), response);
    }
    loadFile(path, response) {
        var _fs = fs.createReadStream(path).on('ready', (e) => {
            _fs.pipe(response);
        }).on('error', (e) => {
            console.log(`err: ${e}`);
            response.writeHead(404, { "Content-Type": "text/html" });
            response.write(`Error ${e}`);
            response.end();
        });
    }
    handleByMethod(method, addr, callback) {
        this.handlers[method][addr] = callback;
    }
}
module.exports = pejvak;
