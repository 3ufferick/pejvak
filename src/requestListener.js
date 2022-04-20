import path from "path"
import fs from "fs"

import { pejvakHttpError } from "./errors.js"
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
		for (const v in virtualPaths)
			this.bind(v, virtualPaths[v]);
	}
	listener = (req, res) => {
		try {
			Object.setPrototypeOf(req, pejvakRequest.prototype);
			Object.setPrototypeOf(res, pejvakResponse.prototype);

			/**set global model object*/
			res.model = {};

			req.body = "";
			req.on("data", (chunk) => {
				req.body += chunk;
			});
			req.on("close", () => {
				// this.#runUses(req, res);
				this.#reqType(req);
				this.#runBefores(req, res);
				this.#runHandles(req, res);
			});
			res.on("error", (err) => {
				this.error(err, res);
			});
		} catch (err) {
			this.error(err, res);
		}
	}
	/**Deprecated */
	// #runUses(req, res) {
	// 	// if (this.uses[req.method] !== undefined)
	// 	for (const m in this.uses)
	// 		if (m == req.method || m == "*")
	// 			for (const i of this.uses[m])
	// 				if (i.path == "*" || i.path == req.URL.pathname)
	// 					i.fn.apply(i.fn, [req, res]);
	// 	// for (let i of this.uses) {
	// 	//     if (i.methods.indexOf(req.method) >= 0)
	// 	//         i.fn.apply(i.fn, [req, res]);
	// 	// }
	// }
	#reqType(req) {
		req.handler = this.handlers[req.method]?.[req.URL.pathname];
		if (req.handler) {
			//**handlers with a custom function*/
			if (typeof req.handler?.fn === "function")
				req.handlerType = "function";
			//**handlers loaded from routes file with template */
			else if (typeof req.handler === typeof []) {
				if (req.handler[0].split('.')[1].toLowerCase() == this.pejvak.settings.renderFileExtension)
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
		// if (req.handler !== undefined) {
		//**handlers with a custom function*/
		if (req.handlerType === "function") {
			if (req.handler.before != null) {
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

			if (this.pejvak.settings.forbiden.includes(path.extname(rep)))
				throw new pejvakHttpError(403);

			this.loadStaticFile(path.normalize(rep), req, res);
		}
	}
	loadStaticFile(path, req, res) {
		fs.stat(path, (err, stat) => {
			const sendStream = () => {
				res.writeHead(200, {
					"Last-Modified": stat.mtime.toUTCString(),
					"Content-Length": stat.size
				});
				const _fs = fs.createReadStream(path).on('ready', () => {
					_fs.pipe(res);
				}).on('error', (err) => {
					_fs.destroy();
					this.error(err, res);
				}).on('end', () => {
					_fs.destroy();
					res.end();
				});
			};
			if (err != null) {
				this.error(err, res);
				return;
			}
			stat.mtime.setMilliseconds(0);
			const isc = req.headers["if-modified-since"];
			if (isc != null) {
				let tisc = new Date(isc);
				// console.log("eq", tisc, stat.mtime, tisc.getTime() == stat.mtime.getTime());
				if (tisc.getTime() == stat.mtime.getTime()) {
					res.writeHead(304, { "Last-Modified": stat.mtime.toUTCString() }).end();
					// res.setHeader("Last-Modified", stat.mtime.toUTCString());//.end();
					// res.status(304).end();
					return;
				}
			}
			sendStream();
		});
	}
	bind(destination, source) {
		this.binds.push({ dst: destination, src: source });
		this.binds.sort(function (a, b) {
			return b.dst.length - a.dst.length;
		});
	}
	error(err, res) {
		if (!(err instanceof pejvakHttpError)) {
			if (err.code == "ENOENT")
				err = new pejvakHttpError(404, err);
			else
				err = new pejvakHttpError(500, err);
		}
		// res.writeHead(err.code, { "Content-Type": "text/html" });
		// res.write(`${err.code}: ${err.message}`);
		// res.end();
		res.status(err.code).send(`${err.code}: ${err.message}`).end();
	}
}
