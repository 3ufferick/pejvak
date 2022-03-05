export default class mimeTypes {
    static types = {
        "application/json": ["json", "map"],
        "text/html": ["html"],
        "application/octet-stream": ["bin"]
    }
    static find(value) {
        for (let i in this.types)
            if (this.types[i].indexOf(value) > -1)
                return i;

    }
}