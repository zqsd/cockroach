import Queryable from './Queryable.mjs';

export default class Transaction extends Queryable {
    async begin() {
        await this.query('BEGIN; SAVEPOINT cockroach_restart;');
    }

    async commit() {
        await this.query('RELEASE SAVEPOINT cockroach_restart; COMMIT;')
    }

    async restart() {
        await this.query('ROLLBACK TO SAVEPOINT cockroach_restart;');
    }

    async rollback() {
        await this.query('ROLLBACK');
    }
};