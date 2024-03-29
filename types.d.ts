interface PatchOperation {
    op: 'add' |
        'remove' |
        'replace' |
        'move' |
        'copy' |
        'test',
    path: string,
    from?: string,
    value?: any
}

export function createPatch(left: any, right: any): any;

export function applyPatch<T>(doc: T, right: PatchOperation[]): any;
