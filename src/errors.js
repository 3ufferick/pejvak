import statusCodes from "./statuscodes.js"

export class pejvakError extends Error {
    constructor(code, baseError) {
        super();
        this.code = code;
        // console.log("base error", baseError);
        this.message = baseError;
        // if (typeof baseError === typeof string)
        //     this.message = baseError;
        // else if (typeof baseError == typeof Error)
        //     this.message = baseError.message;
    }
    // constructor(err, code) {
    //     super();
    //     console.log("ctor", err);
    //     if (err) {
    //         this.message = err.message;
    //         // super(err.message);
    //         this.code = code;
    //     }
    // }
}
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
