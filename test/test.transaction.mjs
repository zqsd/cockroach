import {assert} from 'chai';
import CockroachDb from '../main.mjs';

describe('Transaction', function() {
    let db;

    before(async function() {
        db = new CockroachDb();

        await db.connect(async client => {
            await client.query('DROP TABLE IF EXISTS datas; CREATE TABLE IF NOT EXISTS datas(id UUID PRIMARY KEY DEFAULT gen_random_uuid(), count INT NOT NULL DEFAULT 0)');
        });
    })

    after(async function() {
        /*
        await db.connect(async client => {
            await client.query('DROP TABLE datas');
        });
        */
        db.close();
    });

    describe('.one()', async function() {
        it('should commit', async function() {
            const id = await db.transaction(async transaction => {
                const {id} = await transaction.one('INSERT INTO datas(count) VALUES(42) RETURNING id');
                const row = await transaction.one('SELECT count FROM datas WHERE id = $1', [id]);
                assert.equal(row.count, 42);
                return id;
            });
            await db.connect(async client => {
                const row = await client.one('SELECT count FROM datas WHERE id = $1', [id]);
                assert.equal(row.count, 42);
            });
        });

        it('should rollback', async function() {
            await db.connect(async client => {
                const {id} = await client.one('INSERT INTO datas(count) VALUES(42) RETURNING id');
                try {
                    await db.transaction(async transaction => {
                        await transaction.one('UPDATE datas SET count = count + 1 WHERE id = $1', [id]);
                        const row = await transaction.one('SELECT count FROM datas WHERE id = $1', [id]);
                        assert.equal(row.count, 43);
                        await transaction.one('UPDATE fail'); // will throw error
                    });
                }
                catch(e) {
                }
                const row = await client.one('SELECT count FROM datas WHERE id = $1', [id]);
                assert.equal(row.count, 42);
            });
        });
    });

    describe('#concurrent transactions', async function() {
        it('should violate unique constraint', async function() {
            const id = 'c80b7bb3-3955-4cec-a6d8-46e00d13b0f0';

            try {
                await db.transaction(async t1 => {
                    await t1.one('INSERT INTO datas(id, count) VALUES($1, 42)', [id]);
                    try {
                        await db.transaction(async t2 => {
                            await t1.one('INSERT INTO datas(id, count) VALUES($1, 69)', [id]);
                        });
                        assert.fail();
                    }
                    catch(e) {
                        assert.equal(e.message, 'duplicate key value (id)=(\'c80b7bb3-3955-4cec-a6d8-46e00d13b0f0\') violates unique constraint "primary"');
                    }
                    const {count: count1} = await t1.one('SELECT count FROM datas WHERE id = $1', [id]);
                    assert.equal(count1, 42);
                });
                assert.fail();
            }
            catch(e) {
                assert.equal(e.message, 'current transaction is aborted, commands ignored until end of transaction block');
            }
        });
    });
});