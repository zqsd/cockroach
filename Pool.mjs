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

    async transaction(op, attempts = 3) {
        const client = await this._queryable.connect();
        const transaction = new Transaction(client);

        await transaction.begin();

        let result, ran = false;
        for(let i = 0; i < attempts; i++) {
            try {
                result = await op(transaction); // run task
                await transaction.commit();
                ran = true;
                break;
            }
            catch(e) {
                if(e.code === '40001') { // retryable error
                    await transaction.restart();
                }
                else {
                    await transaction.rollback();
                    client.release();
                    throw e;
                }
            }
        }
        if(!ran) { // failed transaction
            await transaction.rollback();
        }
        client.release();

        return result;
    }
};