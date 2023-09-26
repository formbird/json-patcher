import {applyPatch, createPatch} from "..";
import {expect} from 'chai'

it('round trip maintains fields order', () => {
    const input = {
        xx: 1,
        aa: 2,
    }

    const output = {
        zz: 3,
        aa: 4,
    }

    const patch = createPatch(input, output);
    const patchedOutput = applyPatch(input, patch);

    expect(JSON.stringify(patchedOutput)).to.equal(JSON.stringify({
        aa: 4,
        zz: 3,
    }))
})

it('maintain order', () => {

    const base = {
        documentId: "f5843b4b-dc3b-47f3-b8e3-e7a2a33d36d2",
        systemHeader: {
            templateId: "74746c80-8378-11e6-99b1-71ee944cf59f",
            systemType: "document",
        },
    }
    const original = {
        ...base,
        documentId: "f5843b4b-dc3b-47f3-b8e3-e7a2a33d36d2",
        components: [
            {
                componentName: "name",
                name: "value",
            }
        ]
    }

    const updated = {
        ...base,
        bbb: "zz",
        obj: {
            z: 'last',
            a: 'first'
        },
        components: [
            {
                actually: "this should be first",
                componentName: "name",
                name: "value",
                label: 'abc'
            }
        ],
    }

    const expected = {
        ...base,
        components: [
            {
                componentName: "name",
                name: "value",
                actually: "this should be first",
                label: "abc"
            }
        ],
        bbb: "zz",
        obj: {
            z: 'last',
            a: 'first'
        },
    }
    const patch = createPatch(original, updated);
    const patchedOutput = applyPatch(original, patch);

    expect(JSON.stringify(patchedOutput, null, 4)).to.equal(JSON.stringify(expected, null, 4))
})