export class helpers {
	static parseBody(req, res) {
		req.body = "";
		req.on("data", (chunk) => {
			req.body += chunk;
		});
		req.on("end", () => {
			if (req.headers["content-type"] && req.headers["content-type"].startsWith("application/json")) {
				try {
					req.body = JSON.parse(req.body);
				}
				catch {
					console.log("error converting json");
				}
			}
		});
	}
}