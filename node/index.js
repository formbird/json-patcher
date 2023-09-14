const bindings = require("./diff_updater.node");

const PREFIX = '$::date:'
function replacer(k) {
    const v = this[k]
    return v instanceof Date ? `${PREFIX}${v.toISOString()}` : v
};

const reviver = (k, v) => typeof v === 'string' && v.startsWith(PREFIX) ? new Date(v.slice(8)) : v

function createPatch(left, right) {
    const stringifiedLeft = JSON.stringify(left, replacer)
    const stringifiedRight = JSON.stringify(right, replacer)
    const ret = bindings.createPatch(stringifiedLeft, stringifiedRight)
    return JSON.parse(ret, reviver)
}

function applyPatch(doc, patches) {
    const stringifiedDoc = JSON.stringify(doc, replacer)
    const stringifiedPatches = JSON.stringify(patches, replacer)
    const ret = bindings.applyPatch(stringifiedDoc, stringifiedPatches)
    return JSON.parse(ret, reviver)
}


module.exports = {
    createPatch,
    applyPatch,
}
