import http from "http"
import https from "https"
import fs from "fs"
import path from "path"
import { renderFile } from "./render.js"
import { pejvakHttpError } from "./errors.js"
import { EventEmitter } from "events";

export default class pejvak extends EventEmitter {
	server = undefined;
	handlers = { "GET": {}, "POST": {} };
	binds = [];
	settings = {};
	constructor(routes, virtualPaths, settings) {
		super();
		this.settings = settings;
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
				this.error(err, response);
			}
		}).listen(this.settings.port, () => {
			console.log("server started on port", this.settings.port);
		});
		this.server.on("close", () => { this.emit("closed"); });
	}
	startHTTPS() {
		this.server = https.createServer({
			key: fs.readFileSync(this.settings.https.keyFile),
			cert: fs.readFileSync(this.settings.https.certFile)
		}, (request, response) => {
			try {
				this.handleRequests(request, response);
			} catch (err) {
				this.error(err, response);
			}
		}).listen(this.settings.https.port, () => {
			console.log("secure server started on port", this.settings.https.port);
		});
		this.server.on("close", () => { this.emit("closed"); });
	}
	stop(cb) {
		this.server.close(cb);
	}
	handleRequests(request, response) {
		const _url = new URL(request.url, `http://${request.headers.host}`);
		const pathName = _url.pathname;
		const handler = this.handlers[request.method][pathName];
		//**handlers with a custom function*/
		if (handler && typeof handler === "function") {
			handler(request, response);
		}
		//**handlers loaded from routes file */
		else if (handler && typeof handler === typeof []) {
			if (handler[0].split('.')[1].toLowerCase() == this.settings.renderFileExtension)
				this.render(response, handler[0], handler[1], this.settings);
			else
				this.loadStaticFile(path.normalize(this.settings.www + handler[0]), response);
		}
		//**handler for other static files */
		else {
			let rep = pathName;
			for (const i in this.binds)
				rep = rep.replace(this.binds[i].dst, this.binds[i].src);
			if (rep == pathName)
				rep = this.settings.www + pathName;

			if (this.settings.forbiden.includes(path.extname(rep)))
				throw new pejvakHttpError(403);

			this.loadStaticFile(path.normalize(rep), response);
		}
	}
	render(response, file, template, settings, model) {
		renderFile(file, template, settings, model).then(result => {
			response.writeHead(200, { "Content-Type": "text" });
			response.write(result);
			response.end();
		}).catch(err => {
			// console.log("inside err", err);
			if (err.code == 'ENOENT')
				this.error(new pejvakHttpError(404), response);
			else
				this.error(err, response);
		});
	}
	loadStaticFile(path, response) {
		let _fs = fs.createReadStream(path).on('ready', (e) => {
			_fs.pipe(response);
		}).on('error', (err) => {
			this.error(new pejvakHttpError(404), response);
			// throw new pejvakHttpError(404);
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
	error(error, response) {
		if (!(error instanceof pejvakHttpError))
			error = new pejvakHttpError(500, error);
		response.writeHead(error.code, { "Content-Type": "text/html" });
		response.write(`${error.code}: ${error.message}`);
		response.end();
	}
	// defineProperty(obj, name, value) {
	// 	Object.defineProperty(obj, name, {
	// 		value,
	// 		writable: true
	// 	});
	// }
}
