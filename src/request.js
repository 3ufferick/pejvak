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
    _query;
    get query() {
        if (this._query == undefined) {
            this._query = {};
            for (let i of this.URL.searchParams.keys())
                this._query[i.toLowerCase()] = this.URL.searchParams.get(i);
        }
        return this._query;
    }
    // query(name) {
    //     return this.URL.searchParams.get(name);
    // }
}
