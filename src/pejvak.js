import http from "http"
import https from "https"
import fs from "fs"
import { EventEmitter } from "events";
import { pejvakRequestListener } from "./requestListener.js"
import { type } from "os";
// import { pejvakResponse } from "./response.js"

export default class pejvak extends EventEmitter {
	server = undefined;
	settings = {};
	request;
	response;
	requestListener;
	constructor(routes, virtualPaths, settings) {
		super();
		this.settings = settings;
		this.requestListener = new pejvakRequestListener(this, routes, virtualPaths);
	}
	start() {
		this.server = http.createServer(this.requestListener.listener).listen(this.settings.port, () => {
			console.log("server started on port", this.settings.port);
		});
		this.server.on("close", () => { this.emit("closed"); });
	}
	startHTTPS() {
		this.server = https.createServer({
			key: fs.readFileSync(this.settings.https.keyFile),
			cert: fs.readFileSync(this.settings.https.certFile)
		}, this.requestListener.listener).listen(this.settings.https.port, () => {
			console.log("secure server started on port", this.settings.https.port);
		});
		this.server.on("close", () => { this.emit("closed"); });
	}
	stop(cb) {
		this.server.close(cb);
	}
	handle() {
		const processPaths = (method, paths, fn) => {
			if (this.requestListener.handlers[method] == undefined)
				this.requestListener.handlers[method] = {};
			if (Array.isArray(paths))
				for (const path of paths)
					this.requestListener.handlers[method][path] = fn;
			else if (typeof paths === "string")
				this.requestListener.handlers[method][paths] = fn;
		}
		/**
		 * handle(method, addr, fn)
		 */
		if (arguments.length == 3 && typeof arguments[0] == "string" && typeof arguments[1] == "string" && typeof arguments[2] == "function") {
			// if (this.requestListener.handlers[arguments[0]] === undefined)
			// 	this.requestListener.handlers[arguments[0]] = {};
			processPaths(arguments[0], arguments[1], arguments[2]);
			// this.requestListener.handlers[arguments[0]][arguments[1]] = arguments[2];
		}
		// /**
		//  * handle(fn)
		//  */
		// else if (arguments.length == 1 && typeof arguments[0] == "function") {
		// 	processPaths("*", "*", arguments[0]);
		// }
	}
	before(fn) {
		// console.log("app:before");
		this.requestListener.befores.push(fn);
	}
	//deprecated
	// use(routes, fn) {
	// 	const processPaths = (method, paths) => {
	// 		if (this.requestListener.uses[method] == undefined)
	// 			this.requestListener.uses[method] = [];
	// 		if (Array.isArray(paths))
	// 			for (const path of paths)
	// 				this.requestListener.uses[method].push({ path: path, fn: fn });
	// 		else if (typeof paths === "string")// && paths == "*")
	// 			this.requestListener.uses[method].push({ path: paths, fn: fn });
	// 	}
	// 	for (const r of routes) {
	// 		if (Array.isArray(r.methods))
	// 			for (const method of r.methods)
	// 				processPaths(method, r.paths);
	// 		else if (typeof r.methods === "string")// && r.methods == "*")
	// 			processPaths(r.methods, r.paths);
	// 	}
	// }
}