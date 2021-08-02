"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const Queryable_1 = require("./Queryable");
class Client extends Queryable_1.Queryable {
    constructor(queryable) {
        super();
        this._queryable = queryable;
    }
    _query(query, values) {
        return this._queryable.query(query, values);
    }
    close() {
        return this._queryable.release();
    }
}
exports.Client = Client;
