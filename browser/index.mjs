import { applyPatch as applyPatchImpl, createPatch as createPatchImpl } from './json_patcher'

export function applyPatch(x, y) {
    return applyPatchImpl(x, y)
}

export function createPatch(x, y) {
    return createPatchImpl(x, y)
}
