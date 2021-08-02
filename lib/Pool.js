"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CockroachDB = void 0;
const pg_1 = __importDefault(require("pg"));
const Client_1 = require("./Client");
const Queryable_1 = require("./Queryable");
const Transaction_1 = require("./Transaction");
const parseConfig_1 = require("./parseConfig");
class CockroachDB extends Queryable_1.Queryable {
    constructor(config) {
        super();
        const pgConfig = parseConfig_1.parseConfig(config);
        this._queryable = new pg_1.default.Pool(pgConfig);
    }
    _query(query, values) {
        return this._queryable.query(query, values);
    }
    async connect(op) {
        const client = new Client_1.Client(await this._queryable.connect());
        if (op) {
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
    async transaction(op, attempts = 3) {
        const client = await this._queryable.connect();
        const transaction = new Transaction_1.Transaction(client);
        await transaction.begin();
        let result, ran = false;
        for (let i = 0; i < attempts; i++) {
            try {
                result = await op(transaction); // run task
                await transaction.commit();
                ran = true;
                break;
            }
            catch (e) {
                if (e.code === '40001') { // retryable error
                    await transaction.restart();
                }
                else {
                    await transaction.rollback();
                    client.release();
                    throw e;
                }
            }
        }
        if (!ran) { // failed transaction
            await transaction.rollback();
        }
        client.release();
        return result;
    }
}
exports.CockroachDB = CockroachDB;
