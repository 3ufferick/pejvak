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
    _cookies;
    get cookies() {
        const decode = (s) => {
            try { return decodeURIComponent(s); }
            catch { return s; }
        }
        if (this._cookies == undefined) {
            this._cookies = {};
            let pairs = decode(this.headers.cookie).split(";");
            for (let i = 0; i < pairs.length; i++) {
                const idx = pairs[i].indexOf("=");
                if (idx < 0)
                    continue;
                const key = pairs[i].substring(0, idx).trim();
                const val = pairs[i].substring(idx + 1, pairs[i].length).trim();
                if (val[0] == '"')
                    val = val.slice(1, -1);
                this._cookies[key] = val;
            }
        }
        return this._cookies;
    }
    // query(name) {
    //     return this.URL.searchParams.get(name);
    // }
}
