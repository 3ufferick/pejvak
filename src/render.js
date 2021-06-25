import loadFile from "./loadfile.js";
import http from "http"

export function render(file, template) {
	return new Promise(function (resolve, reject) {
		console.log("file", file);
		loadFile(file)
			.then(data => {
				console.log("then");
				var render = data.toString();
				let regexp = /@part:(\w*)\s*{([\s\S]*)}\s*part:\1;/igm;
				let ex;
				let parts = {};
				while (ex = regexp.exec(render))
					parts[ex[1]] = ex[2];
				loadFile(template)
					.then(data => {
						console.log("template", template);
						var result = data.toString();
						let regexp = /{@(\w*)}/igm;
						result = result.replace(regexp, function (match, g1) {
							return parts[g1];
						});
						resolve(result);
					}).catch(err => {
						reject(err);
					});
			})
			.catch(err => {
				console.error(err);
			});
	});
}

export function renderHTML(response, file, template) {
	render(file, template)
		.then(result => {
			response.writeHead(200, { "Content-Type": "text/html" });
			response.write(result);
			response.end();
		})
		.catch(err => {
			console.error(err);
		});
}

http.ServerResponse.prototype.renderHTML = renderHTML;
