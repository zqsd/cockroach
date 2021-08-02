import pg from 'pg';
import {Queryable} from './Queryable';

export class Transaction extends Queryable {
    _queryable : pg.ClientBase;

    constructor(queryable : any) {
        super();

        this._queryable = queryable;
    }

    _query(query: string, values: any[]) : any {
        return this._queryable.query(query, values);
    }

    async begin() {
        await this.query('BEGIN; SAVEPOINT cockroach_restart;');
    }

    async commit() {
        await this.query('RELEASE SAVEPOINT cockroach_restart; COMMIT;')
    }

    async restart() {
        await this.query('ROLLBACK TO SAVEPOINT cockroach_restart;');
    }

    async rollback() {
        await this.query('ROLLBACK');
    }
};