import http from "http"

/**
 * pejvak response object
 */
export default class pejvakResponse extends http.ServerResponse{
    #setContentType(value): null;
    /**
     * 
     * @param {Number} statusCode http status code
     * @returns {pejvakResponse} for chain calls
     */
    status(statusCode: String): pejvakResponse;

    /**
     * end of http response
     */
    end(): void;
}