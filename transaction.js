class TransactionCancelError extends Error {
}

function transaction(pool) {
    return async function transaction(op, givenClient, attempts = 10) {
        const client = givenClient || await pool.connect();

        client.query('BEGIN; SAVEPOINT cockroach_restart');

        let released = false;
        let result;
        do {
            try {
                // do task
                result = await op(client);
                // task successful, commit
                await client.query('RELEASE SAVEPOINT cockroach_restart; COMMIT;');
                released = true;
            }
            catch(e) {
                // rollback and restart retryable errors
                // unique constraints exception can also happen if we try to add the same non primary index in two different transactions
                if(attempts-- > 0 && (e.code === '40001' || e.code === '23505')) {
                    await client.query('ROLLBACK TO SAVEPOINT cockroach_restart;');
                    //await client.query('ROLLBACK TO SAVEPOINT cockroach_restart;');
                }
                else {
                    await client.query('ROLLBACK;')
                    try {
                        client.release();
                    }
                    catch(e) {}

                    if(e instanceof TransactionCancelError) {
                        return;
                    }
                    else {
                        throw e;
                    }
                }
            }
        } while(!released);

        if(!givenClient) {
            client.release();
        }

        return result;
    }
}

module.exports = {
    transaction,
    TransactionCancelError,
};