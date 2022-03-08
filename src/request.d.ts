import http from "http"
import { URL } from "url"

/**
 * pejvak response object
 */
export default class pejvakRequest extends http.IncomingMessage {
    /**
     * URL object
     */
    get URL(): URL;
    /**
     * a shortcut to URL.searchParam.get() function
     * @param {String} name searchParam name
     * @returns {String}
     */
    query(name: String): String;
}