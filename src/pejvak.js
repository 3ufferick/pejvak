const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const render = require("./render");

class pejvak {
    server = undefined;
    settings = undefined;
    // routes = undefined;
    handlers = { "GET": {}, "POST": {} };
    binds = [];

    constructor(settings, routes, virtualPaths) {
        this.settings = settings;

        for (const addr in routes)
            this.handlers["GET"][addr] = routes[addr];
        for (const v in virtualPaths)
            this.bind(v, virtualPaths[v]);
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
        console.log(`url: ${request.url}\npathName: ${pathName}\nfile: ${path.parse(pathName).name}\n`);
        // console.dir(path_);
        var handler = this.handlers[request.method][pathName];
        if (handler && typeof handler == "function")
            handler(request, response);
        else if (handler && typeof handler == "string") {
            if (handler.split('.')[1].toLowerCase() == 'render')
                render(path.normalize(this.settings.www + handler), "./view/main.template")
                    .then(result => {
                        response.writeHead(200, { "Content-Type": "text/html" });
                        response.write(result);
                        response.end();
                    })
                    .catch(err => {
                        console.error(err);
                    });
            else
                this.loadStaticFile(path.normalize(this.settings.www + handler), response);
        }
        else {
            var rep = pathName;
            for (const i in this.binds)
                rep = rep.replace(this.binds[i].dst, this.binds[i].src);
            if (rep == pathName)
                rep = this.settings.www + pathName;
            this.loadStaticFile(path.normalize(rep), response);
        }
    }
    loadStaticFile(path, response) {
        var _fs = fs.createReadStream(path).on('ready', (e) => {
            _fs.pipe(response);
        }).on('error', (e) => {
            console.log(`${e}`);
            response.writeHead(404, { "Content-Type": "text/html" });
            response.write(`${e}`);
            response.end();
        });
    }
    handle(method, addr, callback) {
        this.handlers[method][addr] = callback;
    }
    bind(destination, source) {
        this.binds.push({ dst: destination, src: source });
        this.binds.sort(function (a, b) {
            return b.dst.length - a.dst.length;
        });
    }
}
module.exports = pejvak;
