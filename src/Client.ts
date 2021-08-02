import pg from 'pg';
import {Queryable} from './Queryable';

export class Client extends Queryable {
    _queryable : pg.PoolClient;

    constructor(queryable: pg.PoolClient) {
        super();
        this._queryable = queryable;
    }

    _query(query: string, values: any[]) : any {
        return this._queryable.query(query, values);
    }

    close() {
        return this._queryable.release();
    }
}