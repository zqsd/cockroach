const fs = require('fs');
const {Pool} = require('pg');
const path = require('path');
const {transaction, TransactionCancelError} = require('./transaction');

function createPool() {
    const config = {
        host: config.host || process.env.COCKROACH_HOST || '127.0.0.1',
        port: config.port || process.env.COCKROACH_PORT || 26257,
        user: config.user || process.env.COCKROACH_USER || 'root',
        database: config.database || process.env.COCKROACH_DATABASE || 'defaultdb',
    };
    const insecure = config.insecure || process.env.COCKROACH_INSECURE ? process.env.COCKROACH_INSECURE == 'true' : true;
    if((process.env.COCKROACH_CERTS_DIR || config.certsDir) && !insecure) {
        const certsDir = config.certsDir || process.env.COCKROACH_CERTS_DIR;
        config.ssl = {
            ca: fs.readFileSync(path.join(certsDir, 'ca.crt')).toString(),
            key: fs.readFileSync(path.join(certsDir, `client.${config.user}.key`)).toString(),
            cert: fs.readFileSync(path.join(certsDir, `client.${config.user}.crt`)).toString(),
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
