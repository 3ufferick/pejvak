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
		 * @param {string} path static file path
		 * @param {string} response http.ServerResponse object
		 */
		loadStaticFile(path: string, response: http.ServerResponse): void;

		/**
		 * handles http method with a given address and a function
		 * @param {string} method "GET" or "POST" or ...
		 * @param {string} addr routing address begin with "/"
		 * @param {(req, res) => void} fn function(req, res)
		 */
		handle(method: string, addr: string, fn: pejvakListener);

		/**
		 * handles http method with a given address and a function with before function support
		 * @param {string} method "GET" or "POST" or ...
		 * @param {string} addr routing address begin with "/"
		 * @param {(req, res) => void} before function(req, res)
		 * @param {(req, res) => void} fn function(req, res)
		 */
		handle(method: string, addr: string, before: pejvakListener, fn: pejvakListener);

		// /**
		//  * runs function for all http methods with all route given addresses
		//  * @param {(req, res) => void} fn function(req, res)
		//  */
		// handle(fn: pejvakListener);

		/**
		 * run functions before handle methods
		 * @param {(req: pejvakRequest, res: pejvakResponse) => void} fn function(req, res)
		 */
		before(fn: (req: pejvakRequest, res: pejvakResponse) => void)

		// /**
		//  * 
		//  * @param {Array} routes array of {method: ["GET", "POST", ...], paths: ["./path1", ...]}
		//  * or array of {method: "* " , paths: "*"}
		//  * @param {(req, res) => void} fn function(req, res)
		//  */
		// use(routes: Array, fn: pejvakListener);
	}
}
