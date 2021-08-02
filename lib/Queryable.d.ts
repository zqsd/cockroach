export declare abstract class Queryable {
    abstract _query(query: string, values: any[]): any;
    query(query: string, ...values: any[]): any;
    one(query: string, ...values: any): object;
    all(query: string, ...values: any): object[];
    multi(query: string, ...values: any): Promise<object[][]>;
    /**
     * Execute a query and apply given callback on each row
     * Don't use this for large number of rows since Cockroachdb doesn't implement cursors.
     * Ref: https://github.com/cockroachdb/cockroach/issues/30352#issuecomment-422390355
     */
    each(query: string, op: (row: any, i: number) => Promise<boolean | undefined>, ...values: any): Promise<void>;
    map(query: string, op: (row: any, i: number) => Promise<boolean | undefined>, ...values: any): Promise<void>;
}
