import http from "http"
import https from "https"
import fs from "fs"
import { EventEmitter } from "events";
import { pejvakRequestListener } from "./requestListener.js"
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
	handle(method, addr, callback) {
		this.requestListener.handlers[method][addr] = callback;
	}
	use(routes, fn) {
		const processPaths = (method, paths) => {
			if (this.requestListener.uses[method] == undefined)
				this.requestListener.uses[method] = [];
			if (Array.isArray(paths))
				for (const path of paths)
					this.requestListener.uses[method].push({ path: path, fn: fn });
			else if (typeof paths === "string")// && paths == "*")
				this.requestListener.uses[method].push({ path: paths, fn: fn });
		}
		for (const r of routes) {
			if (Array.isArray(r.methods))
				for (const method of r.methods)
					processPaths(method, r.paths);
			else if (typeof r.methods === "string")// && r.methods == "*")
				processPaths(r.methods, r.paths);
		}
		// console.log("uses", this.requestListener.uses);
		// this.requestListener.uses.push({ routes: routes, fn: fn });
	}
	// defineProperty(obj, name, value) {
	// 	Object.defineProperty(obj, name, {
	// 		value,
	// 		writable: true
	// 	});
	// }
}