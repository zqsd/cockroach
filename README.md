
Cockroach
=========
Wrapper around [node-postgres library](https://node-postgres.com/) to help connecting to a [cockroach database](https://www.cockroachlabs.com/get-started-cockroachdb/).

Usage
=====

Installation
------------

`npm install git+https://github.com/zqsd/cockroach`

Setup
-----

You can get a connexion pool directly :

```
const pool = require('cockroach).createPool();
```

Set environment variables to configure the server. Defaults are :
```
COCKROACH_HOST=127.0.0.1
COCKROACH_PORT=27257
COCKROACH_USER=root
COCKROACH_DATABASE=defaultdb
COCKROACH_INSECURE=true
```

For ssl set :
```
COCKROACH_INSECURE=false
COCKROACH_CERTS_DIR=certs
```

With the certs dir containing the files : `ca.crt`, `client.root.crt` and `client.root.key` (change root to your user).

Transactions
------------

There is an helper available that supports cockroachdb transaction with autoretry :

```
await result = pool.transaction(async client => {
    return client.query('SELECT * FROM table');
});
console.log(result.rows);
```
