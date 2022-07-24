import http from "http"
import https from "https"
import fs from "fs"
import { EventEmitter } from "events";
import { pejvakRequestListener } from "./requestListener.js"
import { pejvakHttpError } from "./errors.js"

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
		this.on("httpError", this.#defaultError);
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
		const processPaths = (method, paths, args, before, fn) => {
			// console.log("p.paths", method, paths);
			if (this.requestListener.handlers[method] == undefined)
				this.requestListener.handlers[method] = {};
			if (Array.isArray(paths))
				for (const path of paths)
					this.requestListener.handlers[method][path] = { method: method, path: path, args: args, before: before, fn: fn };
			else if (typeof paths === "string")
				this.requestListener.handlers[method][paths] = { method: method, path: paths, args: args, before: before, fn: fn };
		}
		/**
		 * handle(method, paths, fn)
		 */
		if (arguments.length == 3 && typeof arguments[0] == "string" && (typeof arguments[1] == "string" || Array.isArray(arguments[1]))
			&& typeof arguments[2] == "function") {
			processPaths(arguments[0], arguments[1], null, null, arguments[2]);
		}
		/**
		 * handle(method, paths, before, fn)
		 */
		if (arguments.length == 4 && typeof arguments[0] == "string" && (typeof arguments[1] == "string" || Array.isArray(arguments[1]))
			&& typeof arguments[2] == "function" && typeof arguments[3] == "function") {
			processPaths(arguments[0], arguments[1], null, arguments[2], arguments[3]);
		}
		/**
		 * handle(method, paths, args, before, fn)
		 */
		if (arguments.length == 5 && typeof arguments[0] == "string" && (typeof arguments[1] == "string" || Array.isArray(arguments[1]))
			&& typeof arguments[2] == "object" && typeof arguments[3] == "function" && typeof arguments[4] == "function") {
			processPaths(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
		}
	}
	before(fn) {
		// console.log("app:before");
		this.requestListener.befores.push(fn);
	}
	#defaultError(err, res) {
		// if (!(err instanceof pejvakHttpError)) {
		if (isNaN(err)) {
			if (err.code == "ENOENT")
				err = new pejvakHttpError(404, err);
			else
				err = new pejvakHttpError(500, err);
		}
		else
			err = new pejvakHttpError(err);

		res.status(err.code).send(`${err.code}: ${err.message}`).end();
		// console.log("#defaultError", err);
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