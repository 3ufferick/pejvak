import http from "http"
import pejvakRequest from "./request.js"
import pejvakResponse from "./response.js"
/**
 * creates a pejvak server instance
 * @param settings settings object
 * @param routes key/value object
 * @param virtualPaths key/value object
 */
 declare module 'pejvak' {
	export type pejvakListener = (req: pejvakRequest, res: pejvakResponse) => void;
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
		handle(method: String, addr: String, callback: pejvakListener);

		/**
		 * 
		 * @param {Array} routes array of {method: ["GET", "POST", ...], paths: ["./path1", ...]}
		 * or array of {method: "* " , paths: "*"}
		 * @param {function(request, response)} fn function(request, response)
		 */
		use(routes: Array, fn: pejvakListener);
	}
}
 