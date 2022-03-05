import http from "http"
import { renderFile } from "./render.js"
import { pejvakHttpError } from "./errors.js"
import mime from "./mimetypes.js"

export class pejvakResponse extends http.ServerResponse {
    constructor() {
        super();
    }
    setContentType(value) {
        if (this.getHeader("content-type") == undefined)
            this.setHeader("content-type", value);
    }
    status(statusCode) {
        this.statusCode = statusCode;
        return this;
    }
    send(body) {
        switch (typeof body) {
            case "string":
                this.setContentType(mime.find("html") + "; charset=utf-8");
                this.write(body);
                break;
            case "object":
                if (Buffer.isBuffer(body))
                    this.setContentType(mime.find("bin"));
                else {
                    this.setContentType(mime.find("json"));
                    body = JSON.stringify(body);
                }
                this.write(body);
                break;
        }
        return this;
    }
    // json(body) {
    //     this.#setContentType(mime.find("json"));
    //     return JSON.stringify(body);
    // }
    render(file, template, settings, model) {
        renderFile(file, template, settings, model).then(result => {
            this.status(200).send(result).end();
            // this.writeHead(200, { "Content-Type": "text" });
            // this.write(result);
            // this.end();
        }).catch(err => {
            this.emit("error", err);
            // if (err.code == 'ENOENT')
            //     this.emit("error", new pejvakHttpError(404));
            // else
            //     this.emit("error", err);
        });
    }
}