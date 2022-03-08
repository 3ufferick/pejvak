import http from "http"
import { URL } from "url"

/**
 * pejvak request class
 */
export default class pejvakRequest extends http.IncomingMessage {
    _URL;
    get URL() {
        if (this._URL == undefined)
            this._URL = new URL(this.url, `http://${this.headers.host}`);
        return this._URL;
    }
    query(name) {
        return this.URL.searchParams.get(name);
    }
}
