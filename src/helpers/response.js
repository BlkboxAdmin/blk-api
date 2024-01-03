class Response {

    constructor() { }

    get statusCode() {
        return this._statusCode;
    }

    set statusCode(v) {
        this._statusCode = v;
    }

    get statusMessage() {
        return this._statusMessage;
    }

    set statusMessage(v) {
        this._statusMessage = v;
    }

    get message() {
        return this._message;
    }

    set message(v) {
        this._message = v;
    }

    get data() {
        return this._data;
    }

    set data(v) {
        this._data = v;
    }

    get isError() {
        return (this.statusCode > 202);
    }

    internalServerError() {
        this.statusCode = 500;
        this.statusMessage = "Internal Server Error";
        this.message = null;
        this.data = null;
    }

    badRequest(message) {
        this.statusCode = 400;
        this.statusMessage = "Bad Request";
        this.message = message;
        this.data = null;
    }

    okRequest(message, data) {
        this.statusCode = 200;
        this.statusMessage = "Ok";
        this.message = message;
        this.data = data;
    }

    insertRequest(message, data = null) {
        this.statusCode = 201;
        this.statusMessage = "Created";
        this.message = message;
        this.data = data;
    }

    updateRequest(message, data = null) {
        this.statusCode = 202;
        this.statusMessage = "Accepted";
        this.message = message;
        this.data = data;
    }

    response() {
        return {
            statusCode: this.statusCode,
            statusMessage: this.statusMessage,
            message: this.message,
            data: this.data,
        };
    }

    createInternalServerError() {
        this.internalServerError();
        return this.response();
    }

    createBadRequest(message) {
        this.badRequest(message);
        return this.response();
    }

    createInsertResponse(message) {
        this.insertRequest(message);
        return this.response();
    }

    createUpdateResponse(message) {
        this.updateRequest(message);
        return this.response();
    }

    createOkResponse(message, data) {
        this.okRequest(message, data);
        return this.response();
    }
}

module.exports = Response;