const {createPool} = require('../main');

const pool = createPool();
pool.transaction(async client => {
    const {rows} = await client.query('SHOW DATABASES');
    console.log(rows);
});