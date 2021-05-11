import fs  from 'fs';
import path from 'path';

export default function parseConfig(cfg) {
    const config = Object.assign({}, cfg);
    config.host = config.host || process.env.COCKROACH_HOST || '127.0.0.1';
    config.port = config.port || process.env.COCKROACH_PORT || 26257;
    config.user = config.user || process.env.COCKROACH_USER || 'root';
    config.database = config.database || process.env.COCKROACH_DATABASE || 'defaultdb';
    const insecure = config.insecure || process.env.COCKROACH_INSECURE ? process.env.COCKROACH_INSECURE == 'true' : true;

    if((process.env.COCKROACH_CERTS_DIR || config.certsDir) && !insecure) {
        const certsDir = config.certsDir || process.env.COCKROACH_CERTS_DIR;
        config.ssl = {
            ca: fs.readFileSync(path.join(certsDir, 'ca.crt')).toString(),
            key: fs.readFileSync(path.join(certsDir, `client.${config.user}.key`)).toString(),
            cert: fs.readFileSync(path.join(certsDir, `client.${config.user}.crt`)).toString(),
        };
    }
    return config;
}