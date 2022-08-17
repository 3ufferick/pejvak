import loadFile from "./loadfile.js";
import * as vm from "vm";

export function renderFile(file, template, settings, model) {
	return new Promise(function (resolve, reject) {
		loadFile(`${settings.view}/${file}`)
			.then(data => {
				const render = data.toString();
				let regexp = /@part:(\w*)\s*{([\s\S]*)}\s*part:\1;/igm;
				let parts = {};
				let ex;
				while (ex = regexp.exec(render)) {
					// const context = {
					// 	model: model,
					// 	ret: ""
					// };
					// compile(ex[2], context);
					// parts[ex[1]] = context.ret;
					parts[ex[1]] = ex[2];
				}
				loadFile(`${settings.view}/${template}`)
					.then(data => {
						let result = data.toString();
						let regexp = /{@(\w*)}/igm;
						result = result.replace(regexp, function (match, g1) {
							return parts[g1] == undefined ? "" : parts[g1];
						});
						/**move compile from file to template:
						 * 1: higher performance due to reducing compile calls to just one time.
						 * 2: rendering global model object also for tempate file */
						const context = {
							model: model,
							ret: ""
						}
						compile(result, context);
						resolve(context.ret);
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
		//---------این خط برای آبجکت های جاوا اسکریپت مشکل ساز میشد---------
		// if (l[0] == '@' || l[0] == '{' || l[0] == '}') {
		if (l[0] == '@') {
			l = l.substr(1);
			lines2 += `${l}\n`;
		}
		//---------برای کامنت های اچ تی ام ال مشکل ساز میشد--------------
		// else if (l.substr(0, 4) != '<!--')
		else //if (l.substr(0, 5) != '<@--')
			lines2 += `ret+=\`${i.replace(/`/g, "&#96;")}\n\`;\n`;
	}
	vm.runInNewContext(lines2, context);
}
