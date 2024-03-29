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
     * query object related to URL.searchParams; keys are all in lowerCase
     * usage: query["key"] (returns string)
     */
    get query(): Object;

    /**
     * cookies object
     */
    get cookies(): Object;
    
    /**
     * the type of handler object
     */
    handlerType: ["function", "render", "handlerStatic", "static"];
}