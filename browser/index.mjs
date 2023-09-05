import { applyPatch as applyPatchImpl, createPatch as createPatchImpl } from './dist/json_patcher'

const PREFIX = '$::date:'
function replacer(k) {
    const v = this[k]
    return v instanceof Date ? `${PREFIX}${v.toISOString()}` : v
};

const reviver = (k, v) => typeof v === 'string' && v.startsWith(PREFIX) ? new Date(v.slice(8)) : v

export function createPatch(left, right) {
    const stringifiedLeft = JSON.stringify(left, replacer)
    const stringifiedRight = JSON.stringify(right, replacer)
    const ret = createPatchImpl(stringifiedLeft, stringifiedRight)
    return JSON.parse(ret, reviver)
}

export function applyPatch(doc, patches) {
    const stringifiedDoc = JSON.stringify(doc, replacer)
    const stringifiedPatches = JSON.stringify(patches, replacer)
    const ret = applyPatchImpl(stringifiedDoc, stringifiedPatches)
    return JSON.parse(ret, reviver)
}
