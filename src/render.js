import loadFile from "./loadfile.js";
export default function render(file, template) {
    return new Promise(function (resolve, reject) {
        loadFile(file)
            .then(data => {
                var render = data.toString();
                let regexp = /@part:(\w*)\s*{([\s\S]*)}\s*part:\1;/igm;
                let ex;
                let parts = {};
                while (ex = regexp.exec(render))
                    parts[ex[1]] = ex[2];
                loadFile(template)
                    .then(data => {
                        var result = data.toString();
                        let regexp = /{@(\w*)}/igm;
                        result = result.replace(regexp, function (match, g1) {
                            console.log(parts[g1]);
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
// module.exports = render;
