const fs = require('fs');
const {Pool} = require('pg');
const {transaction, TransactionCancelError} = require('./transaction');

function createPool(config = {}) {
    config.host = config.host || process.env.PGHOST || '127.0.0.1';
    config.port = config.port || process.env.PGPORT || 26257;
    config.user = config.user || process.env.PGUSER;
    config.database = config.database || process.env.PGDATABASE;
    if (process.env.PGSSLROOTCERT && process.env.PGSSLKEY && process.env.PGSSLCERT ||
        config?.ssl?.ca && config?.ssl?.key && config?.ssl?.cert) {
        config.ssl = {
            ca: fs.readFileSync(process.env.PGSSLROOTCERT || config.ssl.ca).toString(),
            key: fs.readFileSync(process.env.PGSSLKEY || config.ssl.key).toString(),
            cert: fs.readFileSync(process.env.PGSSLCERT || config.ssl.cert).toString(),
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
