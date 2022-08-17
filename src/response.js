import http from "http"
import { renderFile } from "./render.js"
// import mime from "./mimetypes.js"
import mime from "mime"

export class pejvakResponse extends http.ServerResponse {
	status(statusCode) {
		this.statusCode = statusCode;
		return this;
	}
	send(body) {
		if (this.writableEnded == true || this.headersSent == true)
			return this;

		switch (typeof body) {
			case "string":
				this.setHeader("Content-Type", mime.getType("html"));
				break;
			case "object":
				if (Buffer.isBuffer(body))
					this.setHeader("Content-Type", mime.getType("bin"));
				else {
					this.setHeader("Content-Type", mime.getType("json"));
					body = JSON.stringify(body);
				}
				break;
		}
		this.setHeader('Content-Length', Buffer.byteLength(body, 'utf-8'));
		this.write(body);
		return this;
	}
	render(file, template, model = {}) {
		if (this.writableEnded == true)
			return;
		Object.assign(model, this.model);
		//return 
		renderFile(file, template, this.pejvak.settings, model).then(result => {
			if (this?.statusCode != 200)
				this.send(result).end();
			else
				this.status(200).send(result).end();
		}).catch(err => {
			this.emit("error", err);
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