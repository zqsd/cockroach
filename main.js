const pg = require('pg');

async function transaction(op, client) {
    await client.query('BEGIN; SAVEPOINT cockroach_restart;');

    let lastError;
    for(let attempts = 3; attempts > 0; attempts--) {
        try {
            result = await op(client);
            await client.query('RELEASE SAVEPOINT cockroach_restart; COMMIT;');
            return result;
        }
        catch(err) {
            lastError = err;
            // retryable error
            if(err.code === '40001') {
                await client.query('ROLLBACK TO SAVEPOINT cockroach_restart;');
            }
            // non-retryable error
            else {
                break;
            }
        }
    }
    client.release();
}

class Pool extends pg.Pool {
    constructor(...args) {
        super(...args);
        this.transaction = async (op) => {
            const client = await this.connect();
            const result = await transaction(op, client);
            client.release();
            return result;
        };
    }
}

module.exports = {
    Pool,
};
