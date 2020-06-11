const fs = require('fs');
const {Pool} = require('pg');
const {transaction, TransactionCancelError} = require('./transaction');

function createPool() {
    const config = {
        host: process.env.PGHOST || '127.0.0.1',
        port: process.env.PGPORT || 26257,
    };
    if (process.env.PGSSLROOTCERT && process.env.PGSSLKEY && process.env.PGSSLCERT) {
        config.ssl = {
            ca: fs.readFileSync(process.env.PGSSLROOTCERT).toString(),
            key: fs.readFileSync(process.env.PGSSLKEY).toString(),
            cert: fs.readFileSync(process.env.PGSSLCERT).toString(),
        };
    }

    const pool = new Pool(config);

    pool.transaction = transaction(pool);

    return pool;
};

module.exports = {
    createPool,
    TransactionCancelError,
};