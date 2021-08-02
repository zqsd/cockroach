import pg from 'pg';
import { Queryable } from './Queryable';
export declare class Transaction extends Queryable {
    _queryable: pg.ClientBase;
    constructor(queryable: any);
    _query(query: string, values: any[]): any;
    begin(): Promise<void>;
    commit(): Promise<void>;
    restart(): Promise<void>;
    rollback(): Promise<void>;
}
