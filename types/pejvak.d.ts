// import * as http from 'http';
/** this is a comment */
declare public interface pejvakI {
    // server: http.Server;
    // settings: any;
    // routes: any;
    constructor(settings: any, routes: any): null;
    start(routes: { name: string, value: string }, port: Number): void;
    handleRequests(request: http.IncomingMessage, response: http.ServerResponse): void;
}
export declare public class pejvak extends pekvak_ { };
