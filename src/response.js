import http from "http"
import { renderFile } from "./render.js"
import { pejvakHttpError } from "./errors.js"

export default class pejvakResponse extends http.ServerResponse {
    status(statusCode) {
        this.statusCode = statusCode;
        return this;
    }
    render(file, template, settings, model) {
        renderFile(file, template, settings, model).then(result => {
            this.writeHead(200, { "Content-Type": "text" });
            this.write(result);
            this.end();
        }).catch(err => {
            this.emit("error", err);
            // if (err.code == 'ENOENT')
            //     this.emit("error", new pejvakHttpError(404));
            // else
            //     this.emit("error", err);
        });
    }
}