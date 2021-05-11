export default class Queryable {
    constructor(queryable) {
        this._queryable = queryable;
    }

    query(query, values) {
        if(Array.isArray(values)) {
            return this._queryable.query(query, values);
        }
        else {
            const args = Array.prototype.slice.call(arguments, 1);
            return this._queryable.query(query, args);
        }
    }

    /**
     * Executes a query and result one result (or null)
     * @param query 
     * @param values 
     * @returns 
     */
    one(query, values) {
        return this.query.apply(this, arguments).then(r => r.rows.length > 0 ? r.rows[0] : null);
    }

    /**
     * Executes a query and result an array of results
     * @param query 
     * @param values 
     * @returns 
     */
    all() {
        return this.query.apply(this, arguments).then(r => r.rows);
    }

    /**
     * Execute multiple queries
     * @returns Array array of array of rows
     */
    async multi(query, values) {
        const pgResults = await this._queryable.query(query, values);
        if(Array.isArray(pgResults)) {
            return pgResults.map(pgResult => pgResult.rows);
        }
        else {
            return [pgResults.rows];
        }
    }

    /**
     * Execute a query and apply given callback on each row
     * Don't use this for large number of rows since Cockroachdb doesn't implement cursors.
     * Ref: https://github.com/cockroachdb/cockroach/issues/30352#issuecomment-422390355
     */
    async each(query, values, op) {
        const {rows} = await this._queryable.query(query, values);
        for(let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if(await op(row, i)) {
                break;
            }
        }
        return rows;
    }

    async map(query, values, op) {
        const {rows} = await this._queryable.query(query, values);
        for(let i = 0; i < rows.length; i++) {
            rows[i] = await op(rows[i], i);
        }
        return rows;
    }
};