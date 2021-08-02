export abstract class Queryable {
    abstract _query(query: string, values: any[]) : any;

    query(query: string, ...values: any[]) : any;
    query(query: string, values: Array<any>) : any {
        return this._query(query, values);
    }

    one(query: string, ...values: any) : object;
    one(query: string, values: any[]) : object {
        return this._query(query, values).then((r: any) => r.rows.length > 0 ? r.rows[0] : null);
    }

    all(query: string, ...values: any) : object[]
    all(query: string, values: any[] = []) : Array<object> {
        return this._query(query, values).then((r: any) => r.rows);
    }

    async multi(query : string, ...values: any) : Promise<object[][]>;
    async multi(query : string, values: any[]) : Promise<object[][]> {
        const pgResults = await this._query(query, values);
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
    async each(query : string, op: (row: any, i: number) => Promise<boolean | undefined>, ...values: any) : Promise<void>;
    async each(query : string, op: (row: any, i: number) => Promise<boolean | undefined>, values: any[]) : Promise<void> {
        const {rows} = await this._query(query, values);
        for(let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if(await op(row, i)) {
                break;
            }
        }
        return rows;
    }

    async map(query : string, op: (row: any, i: number) => Promise<boolean | undefined>, ...values: any) : Promise<void>;
    async map(query : string, op: (row: any, i: number) => Promise<boolean | undefined>, values: any[]) : Promise<void> {
        const {rows} = await this._query(query, values);
        for(let i = 0; i < rows.length; i++) {
            rows[i] = await op(rows[i], i);
        }
        return rows;
    }
};