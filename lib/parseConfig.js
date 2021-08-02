"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function parseConfig(cfg) {
    const config = Object.assign({}, cfg);
    config.host = config.host || process.env.COCKROACH_HOST || '127.0.0.1';
    config.port = config.port || parseInt(process.env.COCKROACH_PORT) || 26257;
    config.user = config.user || process.env.COCKROACH_USER || 'root';
    config.database = config.database || process.env.COCKROACH_DATABASE || 'defaultdb';
    const insecure = config.insecure || process.env.COCKROACH_INSECURE ? process.env.COCKROACH_INSECURE == 'true' : true;
    if ((process.env.COCKROACH_CERTS_DIR || config.certsDir) && !insecure && !config.ssl) {
        const certsDir = config.certsDir || process.env.COCKROACH_CERTS_DIR;
        config.ssl = {
            ca: fs_1.default.readFileSync(path_1.default.join(certsDir, 'ca.crt')).toString(),
            key: fs_1.default.readFileSync(path_1.default.join(certsDir, `client.${config.user}.key`)).toString(),
            cert: fs_1.default.readFileSync(path_1.default.join(certsDir, `client.${config.user}.crt`)).toString(),
        };
    }
    return config;
}
exports.parseConfig = parseConfig;
