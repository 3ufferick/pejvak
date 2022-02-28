import http from "http"

/**
 * creates a pejvak server instance
 * @param settings settings object
 * @param routes key/value object
 * @param virtualPaths key/value object
 */
export default class pejvak {
	constructor(routes: Object, virtualPaths: Object, settings: Object): void;
	/**
	 * start a new pejvak server
	 */
	start(): void;
	
	/**
	 * start a new pejvak https server
	 */
	startHTTPS(): void;

	handleRequests: http.RequestListener;
	
	/**
	 * load and stream a static html file
	 * @param path static file path
	 * @param response http.ServerResponse object
	 */
	loadStaticFile(path: String, response: http.ServerResponse): void;
	
	/**
	 * handles http method with a given address and a callback function
	 * @param method "GET" or "POST"
	 * @param addr routing address begin with "/"
	 * @param callback callback function(request, response)
	 */
	handle(method: String, addr: String, callback: http.RequestListener);
}