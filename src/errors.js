import statusCodes from "./statuscodes.js"

export class pejvakHttpError extends Error {
    constructor(code, baseError) {
        super();
        this.code = code;
        this.message = baseError == undefined ? "" : baseError;
    }

    get message() {
        return this.code in statusCodes ? statusCodes[this.code] + this._message : "Unknown" + this._message;
    }
    set message(value) {
        this._message = value == "" ? "" : " => " + value;
    }
}
