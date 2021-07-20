import loadFile from "./loadfile.js";
import http from "http"
import { compileFunction } from "vm";
import * as vm from "vm";

function renderFile(file, template, model) {
	return new Promise(function (resolve, reject) {
		loadFile(`${global.settings.www}/${file}`)
			.then(data => {
				const render = data.toString();
				let regexp = /@part:(\w*)\s*{([\s\S]*)}\s*part:\1;/igm;
				let parts = {};
				let ex;
				while (ex = regexp.exec(render)) {
					var context = {
						model: model,
						ret: ""
					};
					compile(ex[2], context);
					parts[ex[1]] = context.ret;// compile(ex[2], context);
				}
				loadFile(`${global.settings.view}/${template}`)
					.then(data => {
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
				reject(err);
			});
	});
}
function compile(code, context) {
	let lines = code.split('\n');
	let lines2 = "";
	for (let i of lines) {
		let l = i.trimStart();
		if (l[0] == '@' || l[0] == '{' || l[0] == '}') {
			if (l[0] == '@')
				l = l.substr(1);
			lines2 += `${l}`;
		}
		else if (l.substr(0, 4) != '<!--')
			lines2 += `ret+=\`${i.replace(/`/g, "&#96;")}\n\`;`;
	}
	vm.runInNewContext(lines2, context);
	// context.ret = context.ret.replace(/&#96;/g, '`');
}
export function renderHTML(response, file, template, model) {
	renderFile(file, template, model)
		.then(result => {
			// response.writeHead(200, { "Content-Type": "text/html" });
			response.writeHead(200, { "Content-Type": "text" });
			response.write(result);
			response.end();
		})
		.catch(err => {
			console.error(err);
		});
}

// http.ServerResponse.prototype.renderHTML = renderHTML;
http.ServerResponse.prototype.renderHTML = function (file, template, model) {
	renderHTML(this, file, template, model);
};
// Object.defineProperty(http.ServerResponse, "renderH", {
// 	value: function(file, template, model) {
// 		return renderHTML(this, file, template, model);
// 	},
// 	writable: true
// });
