import path from "path"
import fs from "fs"

import { renderFile } from "./render.js"
import { pejvakHttpError } from "./errors.js"
import pejvakRequest from "./request.js"
import {pejvakResponse} from "./response.js"

export class pejvakRequestListener {
    pejvak;
    binds = [];
    handlers = { "GET": {}, "POST": {} };
    uses = [];
    constructor(pejvak, routes, virtualPaths) {
        this.pejvak = pejvak;
        for (const i in routes)
            this.handlers["GET"][i] = [routes[i].file, routes[i].template];
        for (const v in virtualPaths)
            this.bind(v, virtualPaths[v]);
    }
    listener = (request, response) => {
        try {
            Object.setPrototypeOf(request, pejvakRequest.prototype);
            Object.setPrototypeOf(response, pejvakResponse.prototype);
            request.body = "";
            request.on("data", (chunk) => {
                request.body += chunk;
            });
            request.on("close", () => {
                this.#runUses(request);
                this.#handleRequests(request, response);
            });
            response.on("error", (err) => {
                this.error(err, response);
            });
        } catch (err) {
            this.error(err, response);
        }
    }
    #runUses(req, res) {
        for (let i of this.uses) {
            if (i.methods.indexOf(req.method) >= 0)
                i.fn.apply(i.fn, [req, res]);
        }
    }
    #handleRequests(request, response) {
        const _url = new URL(request.url, `http://${request.headers.host}`);
        const pathName = _url.pathname;
        const handler = this.handlers[request.method][pathName];
        //**handlers with a custom function*/
        if (handler && typeof handler === "function") {
            handler(request, response);
        }
        //**handlers loaded from routes file */
        else if (handler && typeof handler === typeof []) {
            if (handler[0].split('.')[1].toLowerCase() == this.pejvak.settings.renderFileExtension)
                response.render(handler[0], handler[1], this.pejvak.settings);
            else
                this.loadStaticFile(path.normalize(this.pejvak.settings.www + handler[0]), response);
        }
        //**handler for other static files */
        else {
            let rep = pathName;
            for (const i in this.binds)
                rep = rep.replace(this.binds[i].dst, this.binds[i].src);
            if (rep == pathName)
                rep = this.pejvak.settings.www + pathName;

            if (this.pejvak.settings.forbiden.includes(path.extname(rep)))
                throw new pejvakHttpError(403);

            this.loadStaticFile(path.normalize(rep), response);
        }
    }
    loadStaticFile(path, response) {
        let _fs = fs.createReadStream(path).on('ready', (e) => {
            _fs.pipe(response);
        }).on('error', (err) => {
            this.error(new pejvakHttpError(404), response);
            // throw new pejvakHttpError(404);
        });
    }
    render(response, file, template, settings, model) {
        renderFile(file, template, settings, model).then(result => {
            response.writeHead(200, { "Content-Type": "text" });
            response.write(result);
            response.end();
        }).catch(err => {
            // console.log("inside err", err);
            if (err.code == 'ENOENT')
                this.error(new pejvakHttpError(404), response);
            else
                this.error(err, response);
        });
    }
    bind(destination, source) {
        this.binds.push({ dst: destination, src: source });
        this.binds.sort(function (a, b) {
            return b.dst.length - a.dst.length;
        });
    }
    error(error, response) {
        if (!(error instanceof pejvakHttpError))
            error = new pejvakHttpError(500, error);
        response.writeHead(error.code, { "Content-Type": "text/html" });
        response.write(`${error.code}: ${error.message}`);
        response.end();
    }
}
