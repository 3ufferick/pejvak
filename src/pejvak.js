import http from "http"
import url from "url"
import fs from "fs"
import path from "path"
import * as render from "./render.js"
import { pejvakError, pejvakHttpError } from "./errors.js"

export default class pejvak {
	server = undefined;
	// settings = {};
	handlers = { "GET": {}, "POST": {} };
	binds = [];

	constructor(routes, virtualPaths) {
		// this.settings = settings;

		for (const i in routes)
			this.handlers["GET"][i] = [routes[i].file, routes[i].template];
		for (const v in virtualPaths)
			this.bind(v, virtualPaths[v]);
	}
	start() {
		this.server = http.createServer((request, response) => {
			try {
				this.handleRequests(request, response);
			} catch (err) {
				// console.log("Hereeeeee", err);
				if (err instanceof pejvakError)
					this.error(response, err);
				else
					this.error(response, new pejvakHttpError(500, err));
			}
		}).listen(global.settings.port, () => {
			console.log("server started on port", global.settings.port);
		});
	}
	handleRequests(request, response) {
		// return new Promise((resolve, reject) => {
		// try {
		var pathName = url.parse(request.url).pathname;
		var handler = this.handlers[request.method][pathName];
		//**handlers with a custom function*/
		if (handler && typeof handler === "function") {
			handler(request, response);
		}
		//**handlers loaded from routes file */
		else if (handler && typeof handler === typeof []) {
			if (handler[0].split('.')[1].toLowerCase() == 'render')
				// render.renderHTML(response, path.normalize(global.settings.www + handler[0]), global.settings.view + handler[1]);
				render.renderHTML(response, handler[0], handler[1]);
			else
				this.loadStaticFile(path.normalize(global.settings.www + handler[0]), response);
		}
		//**handler for other static files */
		else {
			let rep = pathName;
			for (const i in this.binds)
				rep = rep.replace(this.binds[i].dst, this.binds[i].src);
			if (rep == pathName)
				rep = global.settings.www + pathName;

			if (global.settings.forbiden.includes(path.extname(rep)))
				throw new pejvakHttpError(403);

			this.loadStaticFile(path.normalize(rep), response);
		}
	}
	loadStaticFile(path, response) {
		var _fs = fs.createReadStream(path).on('ready', (e) => {
			_fs.pipe(response);
		}).on('error', (err) => {
			this.error(response, new pejvakHttpError(404));
			// throw err;//new pejvakHttpError(404);
		});
	}
	handle(method, addr, callback) {
		this.handlers[method][addr] = callback;
	}
	bind(destination, source) {
		this.binds.push({ dst: destination, src: source });
		this.binds.sort(function (a, b) {
			return b.dst.length - a.dst.length;
		});
	}
	error(response, error) {
		if (error instanceof pejvakHttpError) {
			// console.error(`${error.code}:${error.text}:${JSON.stringify(error, null, 2)}`);
			response.writeHead(error.code, { "Content-Type": "text/html" });
			response.write(`error ${error.code}: ${error.text}`);
			response.end();
		}
		else
			console.log("unhandled error:", error);
	}
	defineProperty(obj, name, value) {
		Object.defineProperty(obj, name, {
			value,
			writable: true
		});
	}
}
