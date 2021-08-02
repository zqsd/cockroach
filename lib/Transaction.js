"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const Queryable_1 = require("./Queryable");
class Transaction extends Queryable_1.Queryable {
    constructor(queryable) {
        super();
        this._queryable = queryable;
    }
    _query(query, values) {
        return this._queryable.query(query, values);
    }
    async begin() {
        await this.query('BEGIN; SAVEPOINT cockroach_restart;');
    }
    async commit() {
        await this.query('RELEASE SAVEPOINT cockroach_restart; COMMIT;');
    }
    async restart() {
        await this.query('ROLLBACK TO SAVEPOINT cockroach_restart;');
    }
    async rollback() {
        await this.query('ROLLBACK');
    }
}
exports.Transaction = Transaction;
;
