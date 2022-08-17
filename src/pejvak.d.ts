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
	type pejvakSettingsType = {
		/** main www folder */
		www: string,
		/** view folder containing .template and .pejvakhtml files*/
		view: string,
		/** http port number (usually: 80) */
		port: Number,
		/** default pejvak html file extension (usually: "pejvakhtml") */
		renderFileExtension: string,
		/** all forbidden file extensions (for example: [".pejvakhtml", ".zip"]) */
		forbidenExtensions: string,
		/** in case of using https, complete this setting part */
		https: {
			/** https port number (ussually: 443) */
			port: Number,
			/** key.pem file full path */
			keyFile: string,
			/** cert.pem file full path */
			certFile: string,
		}
	}
	export default class pejvak {
		/**
		 * cerates a pejvak instance
		 * @param {pejvakSettingsType} settings settings object(www,view, port, renderFileExtension, forbidenExtensions, ...)
		 * @param routes key value object: {"/route": {file: "file.pejvakhtml", template: "file.template"},...}
		 * @param virtualPaths 
		 */
		constructor(settings: pejvakSettingsType, routes: object, virtualPaths: object): void;

		/**
		 * start a new pejvak server
		 */
		start(): void;

		/**
		 * start a new pejvak https server
		 */
		startHTTPS(): void;

		/**
		 * stop server
		 * @param cb callback function
		 */
		stop(cb: () => void): void;

		/**
		 * handles http method with a given address
		 * @param method "GET" or "POST" or any other http request methods in capital letters
		 * @param path routing path or array of paths which begins with "/"
		 * @param fn handler function
		 */
		handle(method: string, path: string | string[], fn: (req: pejvakRequest, res: pejvakResponse) => void);

		/**
		 * handles http method with a given address and a before function
		 * @param method "GET" or "POST" or any other http request methods in capital letters
		 * @param path routing path or array of paths which begins with "/"
		 * @param before a single function or array of functions which runs before 'fn'
		 * @param fn handler function
		 */
		handle(method: string, path: string | string[],
			before: ((req: pejvakRequest, res: pejvakResponse) => void) | ((req: pejvakRequest, res: pejvakResponse) => void)[],
			fn: (req: pejvakRequest, res: pejvakResponse) => void);

		/**
		 * handles http method with a given address and a before function with args to
		 * @param method "GET" or "POST" or any other http request methods in capital letters
		 * @param path routing path or array of paths which begins with "/"
		 * @param args extra argument object which could be accessed with 'this.args' inside the next 'before' method parameter
		 * @param before a single function or array of functions which runs before 'fn'
		 * @param fn function(req, res)
		 */
		handle(method: string, path: string, args: object,
			before: ((req: pejvakRequest, res: pejvakResponse) => void) | ((req: pejvakRequest, res: pejvakResponse) => void)[],
			fn: (req: pejvakRequest, res: pejvakResponse) => void);

		/**
		* run functions before handle methods
		* @param fn a single function which runs before handles
		*/
		before(fn: (req: pejvakRequest, res: pejvakResponse) => void)
	}
}
