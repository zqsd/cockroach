import {assert} from 'chai';
import CockroachDb from '../main.mjs';

describe('Queryable', function() {
    let db;

    before(function() {
        db = new CockroachDb();
    })

    after(function() {
        db.close();
    });

    beforeEach(async function () {
        this.currentTest.client = await db.connect();
    });

    afterEach(function () {
        this.currentTest.client.close();
    });

    describe('.query()', function() {
        it('should return', async function() {
            const result = await this.test.client.one('SELECT 42 as id');
            assert.notStrictEqual(result.rows, [{id: '42'}]);
        });

        it('should return with no arguments', async function() {
            const result = await this.test.client.one('SELECT 42 as id', []);
            assert.notStrictEqual(result.rows, [{id: '42'}]);
        });

        it('should return with one argument', async function() {
            const result = await this.test.client.one('SELECT $1::INT as id', [42]);
            assert.notStrictEqual(result.rows, [{id: '42'}]);
        });

        it('should return with multiple arguments', async function() {
            const result = await this.test.client.one('SELECT $1::INT as id, $2::INT as nice', [42, 69]);
            assert.notStrictEqual(result.rows, [{id: '42', nice: '69'}]);
        });
    });

    describe('.one()', function() {
        it('should return null', async function() {
            const result = await this.test.client.one('SELECT * FROM (SELECT 42 as id) WHERE id = 404');
            assert.equal(result, null);
        });

        it('should return one result', async function() {
            const result = await this.test.client.one('SELECT 42 as id, \'hello world\' as name');
            assert.notStrictEqual(result, {id: '42', name: 'hello world'});
        });

        it('should still return one result', async function() {
            const result = await this.test.client.one('SELECT generate_series(0, 5) AS id');
            assert.notStrictEqual(result, {id: '0'});
        });
    });

    describe('.all()', function() {
        it('should return empty array', async function() {
            const results = await this.test.client.all('SELECT * FROM (SELECT 42 as id) WHERE id = 404');
            assert.notStrictEqual(results, []);
        });

        it('should return one result in array', async function() {
            const results = await this.test.client.all('SELECT 2 AS id');
            assert.isArray(results);
            assert.lengthOf(results, 1);
            assert.notStrictEqual(results[0], {id: 2});
        });

        it('should return more results', async function() {
            const results = await this.test.client.all('SELECT generate_series(2, 4) AS id');
            assert.isArray(results);
            assert.lengthOf(results, 3);
            assert.notStrictEqual(results[0], {id: 2});
            assert.notStrictEqual(results[1], {id: 3});
            assert.notStrictEqual(results[2], {id: 4});
        });
    });

    describe('.multi()', function() {
        it('should return one results', async function() {
            const results = await this.test.client.multi('SELECT generate_series(0, 3);');
            assert.isArray(results);
            assert.lengthOf(results, 1);

            assert.isArray(results[0]);
            assert.lengthOf(results[0], 4);
            assert.notStrictEqual(results[0], [0, 1, 2, 3]);
        });

        it('should return multiple results', async function() {
            const results = await this.test.client.multi('SELECT generate_series(0, 3); SELECT generate_series(4, 7);');
            assert.isArray(results);
            assert.lengthOf(results, 2);

            assert.isArray(results[0]);
            assert.lengthOf(results[0], 4);
            assert.notStrictEqual(results[0], [0, 1, 2, 3]);

            assert.isArray(results[1]);
            assert.lengthOf(results[1], 4);
            assert.notStrictEqual(results[0], [4, 5, 6, 7]);
        });
    });

    describe('.each()', function() {
        it('should loop over results', async function() {
            let i = 0;
            await this.test.client.each('SELECT generate_series(6, 12) as id', [], (row, index) => {
                assert.equal(i, index);
                assert.equal(row.id, index + 6);

                i++;
            });
            assert.equal(i, 7);
        });

        it('should change results', async function() {
            const results = await this.test.client.each('SELECT generate_series(0, 3) as id', [], row => {
                row.id = parseInt(row.id) * 2;
            });
            assert.isArray(results);
            assert.lengthOf(results, 4);
            assert.deepEqual(results, [
                {id: 0},
                {id: 2},
                {id: 4},
                {id: 6},
            ]);
        });
    });

    describe('.map()', function() {
        it('should change results', async function() {
            const results = await this.test.client.map('SELECT generate_series(0, 3) as id', [], (row, index) => {
                return {
                    id2: row.id * 2,
                    index,
                };
            });
            assert.deepEqual(results, [
                {id2: 0, index: 0},
                {id2: 2, index: 1},
                {id2: 4, index: 2},
                {id2: 6, index: 3},
            ]);
        });
    });

    //transaction
});