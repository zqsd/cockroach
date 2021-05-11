import Queryable from './Queryable.mjs';

export default class Connection extends Queryable {
    constructor(client) {
        super(client);
    }

    close() {
        return this._queryable.release();
    }
};