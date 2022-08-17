import http from "http"

/**
 * pejvak response object
 */
export default class pejvakResponse extends http.ServerResponse {
	/** 
	 * a global model object which merges with the model argument of render function befor rendering
	*/
	model: object;

	/**
	 * 
	 * @param {Number} statusCode http status code
	 * @returns {pejvakResponse} for chain calls
	 */
	status(statusCode: Number): pejvakResponse;

	/**
	 * 
	 * @param {string | object} body string or json or binary buffer data
	 * @returns {pejvakResponse} for chain calls
	 */
	send(body: string | object): pejvakResponse;

	/**
	 * render a .pejvakhtml file with a .template file
	 * @param {string} file pejvakhtml file to render
	 * @param {string} template template file
	 * @param {object} model model data which may be used inside rendering procedure
	 */
	render(file: string, template: srting, model: object): void;

	/**
	 * 
	 * @param {string} name cookie name
	 * @param {string} value cookie value
	 * @param {{ httpOnly: boolean, secure: boolean, maxAge: number, domain: string, path: string, expires: string, sameSite: [Strict, Lax, None] }} options {httpOnly, secure, maxAge, domain, path, expires, sameSite: [Strict, Lax, None]}
	 * @returns {pejvakResponse} for chain calls
	 */
	setCookie(name: string, value: string, options:
		{
			httpOnly: boolean, secure: boolean, maxAge: number,
			domain: string, path: string, expires: string, sameSite: [Strict, Lax, None]
		}): pejvakResponse;
}