import {assert} from 'chai';
import CockroachDb from '../main.mjs';

describe('Pool', function() {
    let db;

    before(function() {
        db = new CockroachDb();
    })

    after(function() {
        db.close();
    });

    describe('.connect()', function() {
        it('should return a client', async function() {
            const client = await db.connect();
            client.close();
            assert.isNotNull(client);
        });

        it('should give a client', async function() {
            await db.connect(async client => {
                assert.isNotNull(client);
            });
        });
    });
});