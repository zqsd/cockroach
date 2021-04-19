const fs = require('fs');
const {Pool} = require('pg');
const path = require('path');
const {transaction, TransactionCancelError} = require('./transaction');

function createPool() {
    const config = {
        host: process.env.COCKROACH_HOST || '127.0.0.1',
        port: process.env.COCKROACH_PORT || 26257,
        user: process.env.COCKROACH_USER || 'root',
        database: process.env.COCKROACH_DATABASE || 'defaultdb',
    };
    const insecure = process.env.COCKROACH_INSECURE ? process.env.COCKROACH_INSECURE == 'true' : true;
    if(process.env.COCKROACH_CERTS_DIR && !insecure) {
        config.ssl = {
            ca: fs.readFileSync(path.join(process.env.COCKROACH_CERTS_DIR, 'ca.crt')).toString(),
            key: fs.readFileSync(path.join(process.env.COCKROACH_CERTS_DIR, `client.${config.user}.key`)).toString(),
            cert: fs.readFileSync(path.join(process.env.COCKROACH_CERTS_DIR, `client.${config.user}.crt`)).toString(),
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