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
	use(methods, fn) {
		this.requestListener.uses.push({ methods: methods, fn: fn });
	}
	// defineProperty(obj, name, value) {
	// 	Object.defineProperty(obj, name, {
	// 		value,
	// 		writable: true
	// 	});
	// }
}