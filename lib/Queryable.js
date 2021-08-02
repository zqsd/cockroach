"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queryable = void 0;
class Queryable {
    query(query, values) {
        return this._query(query, values);
    }
    one(query, values) {
        return this._query(query, values).then((r) => r.rows.length > 0 ? r.rows[0] : null);
    }
    all(query, values = []) {
        return this._query(query, values).then((r) => r.rows);
    }
    async multi(query, values) {
        const pgResults = await this._query(query, values);
        if (Array.isArray(pgResults)) {
            return pgResults.map(pgResult => pgResult.rows);
        }
        else {
            return [pgResults.rows];
        }
    }
    async each(query, op, values) {
        const { rows } = await this._query(query, values);
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (await op(row, i)) {
                break;
            }
        }
        return rows;
    }
    async map(query, op, values) {
        const { rows } = await this._query(query, values);
        for (let i = 0; i < rows.length; i++) {
            rows[i] = await op(rows[i], i);
        }
        return rows;
    }
}
exports.Queryable = Queryable;
;
