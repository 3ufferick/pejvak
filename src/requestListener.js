import path from "path"
import fs from "fs"

import { renderFile } from "./render.js"
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
	#runUses(req, res) {
		// if (this.uses[req.method] !== undefined)
		for (const m in this.uses)
			if (m == req.method || m == "*")
				for (const i of this.uses[m])
					if (i.path == "*" || i.path == req.URL.pathname)
						i.fn.apply(i.fn, [req, res]);
		// for (let i of this.uses) {
		//     if (i.methods.indexOf(req.method) >= 0)
		//         i.fn.apply(i.fn, [req, res]);
		// }
	}
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
			if (req.handler.before != null)
				req.handler.before.apply(req.handler, [req, res]);
			req.handler.fn.apply(req.handler, [req, res]);
		}
		//**handlers loaded from routes file with template */
		else if (req.handlerType === "autoRender") {
			res.render(req.handler[0], req.handler[1], this.pejvak.settings);
		} else if (req.handlerType === "autoStatic")
			this.loadStaticFile(path.normalize(this.pejvak.settings.www + req.handler[0]), res);
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

			this.loadStaticFile(path.normalize(rep), res);
		}
	}
	loadStaticFile(path, response) {
		let _fs = fs.createReadStream(path).on('ready', () => {
			_fs.pipe(response);
		}).on('error', (err) => {
			this.error(new pejvakHttpError(404), response);
		});
	}
	/**Deprecated */
	// render(response, file, template, settings, model) {
	// 	renderFile(file, template, settings, model).then(result => {
	// 		response.writeHead(200, { "Content-Type": "text" });
	// 		response.write(result);
	// 		response.end();
	// 	}).catch(err => {
	// 		// console.log("inside err", err);
	// 		if (err.code == 'ENOENT')
	// 			this.error(new pejvakHttpError(404), response);
	// 		else
	// 			this.error(err, response);
	// 	});
	// }
	bind(destination, source) {
		this.binds.push({ dst: destination, src: source });
		this.binds.sort(function (a, b) {
			return b.dst.length - a.dst.length;
		});
	}
	error(err, res) {
		if (!(err instanceof pejvakHttpError))
			err = new pejvakHttpError(500, err);
		res.writeHead(err.code, { "Content-Type": "text/html" });
		res.write(`${err.code}: ${err.message}`);
		res.end();
	}
}
