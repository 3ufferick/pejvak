import path from "path"
import fs, { fstatSync } from "fs"
import mime from "mime"
import pejvakRequest from "./request.js"
import { pejvakResponse } from "./response.js"

export class pejvakRequestListener {
	pejvak;
	binds = [];
	handlers = {
		"GET": {}, "POST": {}, "HEAD": {}, "PUT": {}, "DELETE": {},
		"CONNECT": {}, "OPTIONS": {}, "TRACE": {}, "PATCH": {}
	};
	uses = {};
	befores = [];
	constructor(pejvak, routes, virtualPaths) {
		this.pejvak = pejvak;
		for (const i in routes)
			this.handlers["GET"][i] = [routes[i].file, routes[i].template];
		for (const v in virtualPaths) {
			// this.bind(v, virtualPaths[v]);
			this.binds.push({ dst: v, src: virtualPaths[v] });
			this.binds.sort(function (a, b) {
				return b.dst.length - a.dst.length;
			});
		}
	}
	listener = (req, res) => {
		try {
			Object.setPrototypeOf(req, pejvakRequest.prototype);
			Object.setPrototypeOf(res, pejvakResponse.prototype);
			res.pejvak = this.pejvak;

			/**set global model object*/
			res.model = {};

			this.#reqType(req);
			this.#runBefores(req, res);
			this.#runHandles(req, res);
			res.on("error", err => {
				this.pejvak.emit("httpError", err, res)
			});
		} catch (err) {
			this.pejvak.emit("httpError", err, res)
		}
	}
	#reqType(req) {
		req.handler = this.handlers[req.method]?.[req.URL.pathname];
		if (req.handler) {
			//**handlers with a custom function*/
			if (typeof req.handler?.fn === "function")
				req.handlerType = "function";
			//**handlers loaded from routes file with template */
			else if (typeof req.handler === typeof []) {
				if (req.handler[0].endsWith(this.pejvak.settings.renderFileExtension))
					req.handlerType = "autoRender";
				else
					req.handlerType = "autoStatic";
			}
		}
		//**handler for other static files */
		else
			req.handlerType = "static";
	}
	#runBefores(req, res) {
		for (let i of this.befores) {
			if (res.writableEnded == true)
				return;
			i.apply(null, [req, res]);
		}
	}
	#runHandles(req, res) {
		if (res.writableEnded == true)
			return;
		//**handlers with a custom function*/
		if (req.handlerType === "function") {
			if (req.handler.before != null)
				if (Array.isArray(req.handler.before)) {
					for (const before of req.handler.before) {
						before.apply(req.handler, [req, res]);
						if (res.writableEnded == true)
							return;
					}
				}
				else if (typeof req.handler.before) {
					req.handler.before.apply(req.handler, [req, res]);
					if (res.writableEnded == true)
						return;
				}
			req.handler.fn.apply(req.handler, [req, res]);
		}
		//**handlers loaded from routes file with template */
		else if (req.handlerType === "autoRender") {
			res.render(req.handler[0], req.handler[1], this.pejvak.settings);
		} else if (req.handlerType === "autoStatic")
			this.loadStaticFile(path.normalize(this.pejvak.settings.www + req.handler[0]), req, res);
		// }
		//**handler for other static files */
		else {
			let rep = req.URL.pathname;
			for (const i in this.binds)
				rep = rep.replace(this.binds[i].dst, this.binds[i].src);
			if (rep == req.URL.pathname)
				rep = this.pejvak.settings.www + req.URL.pathname;

			if (this.pejvak.settings.forbidenExtensions.includes(path.extname(rep))) {
				this.pejvak.emit("httpError", 403, res);
				return;
			}

			this.loadStaticFile(path.normalize(rep), req, res);
		}
	}
	loadStaticFile(path, req, res) {
		fs.stat(path, (err, stat) => {
			const sendStream = () => {
				res.writeHead(200, {
					"Last-Modified": stat.mtime.toUTCString(),
					"Content-Length": stat.size,
					"Content-Type": mime.getType(path)
				});
				const _fs = fs.createReadStream(path).on('ready', () => {
					_fs.pipe(res);
				}).on('error', (err) => {
					_fs.destroy();
					this.pejvak.emit("httpError", err, res);
				}).on('end', () => {
					_fs.destroy();
					res.end();
				});
			};
			if (err != null) {
				if (err.code == "ENOENT")
					this.pejvak.emit("httpError", 404, res);
				else
					this.pejvak.emit("httpError", err, res);
				return;
			}
			if (!stat.isFile()) {
				this.pejvak.emit("httpError", 404, res);
				return;
			}
			stat.mtime.setMilliseconds(0);
			const isc = req.headers["if-modified-since"];
			if (isc != null) {
				let tisc = new Date(isc);
				if (tisc.getTime() == stat.mtime.getTime()) {
					res.writeHead(304, { "Last-Modified": stat.mtime.toUTCString() }).end();
					return;
				}
			}
			sendStream();
		});
	}
	// bind(destination, source) {
	// 	this.binds.push({ dst: destination, src: source });
	// 	this.binds.sort(function (a, b) {
	// 		return b.dst.length - a.dst.length;
	// 	});
	// }
}
