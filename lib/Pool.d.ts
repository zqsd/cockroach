import pg from 'pg';
import { Client } from './Client';
import { Queryable } from './Queryable';
import { Transaction } from './Transaction';
import { ConfigInterface } from './parseConfig';
export declare class CockroachDB extends Queryable {
    _queryable: pg.Pool;
    constructor(config?: ConfigInterface);
    _query(query: string, values: any[]): any;
    connect(op: (client: Client) => Promise<any>): Promise<any>;
    close(): void;
    transaction(op: (transaction: Transaction) => Promise<any>, attempts?: number): Promise<any>;
}
