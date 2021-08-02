import pg from 'pg';
import { Queryable } from './Queryable';
export declare class Client extends Queryable {
    _queryable: pg.PoolClient;
    constructor(queryable: pg.PoolClient);
    _query(query: string, values: any[]): any;
    close(): void;
}
