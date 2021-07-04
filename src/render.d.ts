import http from "http"

/**
 * renders a file with the given template
 * @param response response object
 * @param file path to html file
 * @param template path to template file
 */
function renderHTML(response: http.ServerResponse, file: string, template: string): void;
http.ServerResponse.prototype.renderHTML = (file: string, template: string, model?: Object) => { };
