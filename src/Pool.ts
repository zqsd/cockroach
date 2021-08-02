import pg from 'pg';
import {Client} from './Client';
import {Queryable} from './Queryable';
import {Transaction} from './Transaction';
import {ConfigInterface, parseConfig} from './parseConfig';

export class CockroachDB extends Queryable {
    _queryable : pg.Pool;

    constructor(config?: ConfigInterface) {
        super();
        const pgConfig = parseConfig(config);
        this._queryable = new pg.Pool(pgConfig);
    }

    _query(query: string, values: any[]) : any {
        return this._queryable.query(query, values);
    }

    async connect(op: (client: Client) => Promise<any>) {
        const client = new Client(await this._queryable.connect());
        if(op) {
            const result = await op(client);
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

    async transaction(op: (transaction: Transaction) => Promise<any>, attempts = 3) {
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
}