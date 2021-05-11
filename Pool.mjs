import pg from 'pg';
import Client from './Client.mjs';
import Queryable from './Queryable.mjs';
import Transaction from './Transaction.mjs';
import parseConfig from './parseConfig.mjs';

export default class CockroachDB extends Queryable {
    constructor(config) {
        super();
        const pgConfig = parseConfig(config);
        const pool = new pg.Pool(pgConfig);
        this._queryable = pool;
    }

    async connect(op) {
        const client = new Client(await this._queryable.connect());
        if(op) {
            const result = op(client);
            client.close();
            return result;
        }
        else {
            return client;
        }
    }

    close() {
        this._queryable.end();
    }

    tx() {
        return transaction();
    }

    // nested transaction?
    async transaction(op, optionnalConnection, attempts = 3) {
        const client = optionnalConnection || await this._queryable.connect();
        
    }

    // ensure transaction
};