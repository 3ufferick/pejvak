// const fs = require("fs");
import { readFile } from "fs";
export default function loadFile(filename) {
    return new Promise(function (resolve, reject) {
        readFile(filename, function (err, data) {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}