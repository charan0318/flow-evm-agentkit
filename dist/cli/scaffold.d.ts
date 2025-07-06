interface ScaffoldOptions {
    name: string;
    type: 'observer' | 'executor' | 'full';
    directory?: string;
}
declare function scaffoldAgent(options: ScaffoldOptions): Promise<void>;
export { scaffoldAgent };
//# sourceMappingURL=scaffold.d.ts.map