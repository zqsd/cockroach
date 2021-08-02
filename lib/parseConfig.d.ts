export interface ConfigInterface {
    host?: string;
    port?: number;
    user?: string;
    database?: string;
    insecure?: boolean;
    certsDir?: string;
    ssl?: {
        ca: string;
        key: string;
        cert: string;
    };
}
export declare function parseConfig(cfg?: ConfigInterface): ConfigInterface;
