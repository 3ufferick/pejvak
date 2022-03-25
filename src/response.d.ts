import http from "http"

/**
 * pejvak response object
 */
export default class pejvakResponse extends http.ServerResponse {
    #setContentType(value): null;
    /**
     * 
     * @param {Number} statusCode http status code
     * @returns {pejvakResponse} for chain calls
     */
    status(statusCode: String): pejvakResponse;

    /**
     * 
     * @param {String} data
     * @returns {pejvakResponse} for chain calls
     */
    send(data: String): pejvakResponse;

    /**
     * 
     * @param {Object} data json or binary
     * @returns {pejvakResponse} for chain calls
     */
    send(data: Object): pejvakResponse;

    /**
     * 
     * @param {string} name cookie name
     * @param {string} value cookie value
     * @param {{ httpOnly: boolean, secure: boolean, maxAge: number, domain: string, path: string, expires: string, sameSite: [Strict, Lax, None] }} options {httpOnly, secure, maxAge, domain, path, expires, sameSite: [Strict, Lax, None]}
     */
    setCookie(name: string, value: string, options:
        {
            httpOnly: boolean, secure: boolean, maxAge: number,
            domain: string, path: string, expires: string, sameSite: [Strict, Lax, None]
        }): pejvakResponse;

    /**
     * end of http response
     */
    end(): void;
}