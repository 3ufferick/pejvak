import http from "http"
import { renderFile } from "./render.js"
// import mime from "./mimetypes.js"
import mime from "mime"

export class pejvakResponse extends http.ServerResponse {
	// initModel() {
	// super();
	// Object.defineProperty(this, "model", {
	// 	value: {},
	// 	enumerable: true,
	// 	writable: true,
	// 	configurable: true,
	// });
	// this._model = { b: "2" };
	// }
	// model = {};
	// _model = {};
	// get model() {
	// 	return this._model;// ?? {};
	// }
	// set model(value) {
	// 	this._model = value;
	// }
	// setContentType(value) {
	// 	if (this.getHeader("content-type") == undefined)
	// 		this.setHeader("content-type", value);
	// }
	status(statusCode) {
		this.statusCode = statusCode;
		return this;
	}
	send(body) {
		switch (typeof body) {
			case "string":
				// this.setContentType(mime.find("html") + "; charset=utf-8");
				this.setHeader("Content-Type", mime.getType("html"));
				break;
			case "object":
				if (Buffer.isBuffer(body))
					// this.setContentType(mime.find("bin"));
					this.setHeader("Content-Type", mime.getType("bin"));
				else {
					// this.setContentType(mime.find("json"));
					this.setHeader("Content-Type", mime.getType("json"));
					body = JSON.stringify(body);
				}
				break;
		}
		this.setHeader('Content-Length', Buffer.byteLength(body, 'utf-8'));
		this.write(body);
		return this;
	}
	// json(body) {
	//     this.#setContentType(mime.find("json"));
	//     return JSON.stringify(body);
	// }
	render(file, template, settings, model = {}) {
		Object.assign(model, this.model);
		return renderFile(file, template, settings, model).then(result => {
			if (this?.statusCode != 200)
				this.send(result).end();
			else
				this.status(200).send(result).end();
		}).catch(err => {
			this.emit("error", err);
			// if (err.code == 'ENOENT')
			//     this.emit("error", new pejvakHttpError(404));
			// else
			//     this.emit("error", err);
		});
	}
	setCookie(name, value, options = {}) {
		let c = `${name}=${value}`;

		if (options.httpOnly)
			c += "; HttpOnly";
		if (options.secure)
			c += "; Secure";
		if (options.maxAge) {
			if (isNaN(options.maxAge))
				throw new TypeError("maxAge option must be a number");
			c += `; Max-Age=${options.maxAge}`;
		}
		if (options.domain)
			c += `; Domain=${options.domain}`;
		if (options.path)
			c += `; Path=${options.path}`;
		if (options.expires) {
			if (typeof options.expires.toUTCString != "function")
				throw new TypeError("expires option must be a valid Date");
			c += `; Expires=${options.expires.toUTCString()}`;
		}
		if (options.sameSite) {
			if (typeof options.sameSite !== "string")
				throw new TypeError("sameSite option must be choosed from [Strict, Lax, None]");
			c += `; SameSite=${options.sameSite[0].toUpperCase() + options.sameSite.substring(1).toLowerCase()}`;
		}

		//----append to previous added cookies
		let _setcookie = [];
		let h = this.getHeader("Set-Cookie");
		if (typeof h == "string")
			_setcookie.push(h);
		else if (Array.isArray(h))
			_setcookie = h;
		_setcookie.push(c);
		this.setHeader("Set-Cookie", _setcookie);

		return this;
	}
}