import http from "http"

/**
 * pejvak response object
 */
export default class pejvakResponse extends http.ServerResponse {
	/** 
	 * a global model object which merges with the model argument of render function befor rendering
	*/
	model: Object;

	#setContentType(value): null;
	/**
	 * 
	 * @param {Number} statusCode http status code
	 * @returns {pejvakResponse} for chain calls
	 */
	status(statusCode: String): pejvakResponse;

	/**
	 * 
	 * @param {string} data
	 * @returns {pejvakResponse} for chain calls
	 */
	send(data: string): pejvakResponse;

	/**
	 * render a .pejvakhtml file with a .template file
	 * @param {string} file 
	 * @param {string} template 
	 * @param {Object} settings 
	 * @param {Object} model 
	 */
	render(file: string, template: srting, settings: Object, model: Object);

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