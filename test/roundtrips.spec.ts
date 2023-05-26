import {applyPatch, type PatchOperation} from "..";
import { createParsedPatch as createPatch } from './_index'
import { expect } from 'chai'

function checkRoundtrip(
    input: any,
    output: any,
    expected_patch: PatchOperation[],
    actual_patch: PatchOperation[] = createPatch(input, output)
) {
    expect(actual_patch).to.deep.equal(expected_patch);

    const actualOutput = applyPatch(input, actual_patch);
    if (actualOutput instanceof Map) {
      expect(actualOutput).not.to.instanceOf(Map)
    }
    expect(actualOutput).to.deep.equal(output);
}

it("issues/3", () => {
    const input = {arr: ["1", "2", "2"]};
    const output = {arr: ["1"]};
    const expected_patch: PatchOperation[] = [
        {op: "remove", path: "/arr/1"},
        {op: "remove", path: "/arr/1"},
    ];
    checkRoundtrip(input, output, expected_patch);
});

it("issues/4", () => {
    const input = ["A", "B"];
    const output = ["B", "A"];
    const expected_patch: PatchOperation[] = [
        {op: "replace", path: "/0", value: "B"},
        {op: "replace", path: "/1", value: "A"},
    ];

    checkRoundtrip(input, output, expected_patch);
});

it("issues/5", () => {
    const input: string[] = [];
    const output = ["A", "B"];
    const expected_patch: PatchOperation[] = [
        {op: "add", path: "/0", value: "A"},
        {op: "add", path: "/1", value: "B"},
    ];

    checkRoundtrip(input, output, expected_patch);
});

it("issues/9", () => {
    const input = [{A: 1, B: 2}, {C: 3}];
    const output = [{A: 1, B: 20}, {C: 3}];
    const expected_patch: PatchOperation[] = [
        {op: "replace", path: "/0/B", value: 20},
    ];

    checkRoundtrip(input, output, expected_patch);
});
 

it("issues/12", () => {
    const input = {name: "ABC", repositories: ["a", "e"]};
    const output = {name: "ABC", repositories: ["a", "b", "c", "d", "e"]};
    const expected_patch: PatchOperation[] = [
        {op: "replace", path: "/repositories/1", value: "b"},
        {op: "add", path: "/repositories/2", value: "c"},
        {op: "add", path: "/repositories/3", value: "d"},
        {op: "add", path: "/repositories/4", value: "e"},
    ];
    checkRoundtrip(input, output, expected_patch);
});

it("issues/15", () => {
    const input = {date: new Date(0)};
    const output = {date: '1970-01-01T00:00:00.001+00:00'};
    const expected_patch: PatchOperation[] = [
        { op: 'replace', path: '/date', value: '1970-01-01T00:00:00.001+00:00' }
    ];

    checkRoundtrip(input, output, expected_patch);
});

it("issues/15/array", () => {
    const input = [new Date(0)];
    const output = ['1970-01-01T00:00:00.001+00:00'];
    const expected_patch: PatchOperation[] = [
        {op: "replace", path: "/0", value: '1970-01-01T00:00:00.001+00:00'},
    ];

    checkRoundtrip(input, output, expected_patch);
});

it("issues/32", () => {
    const input = "a";
    const output = "b";
    const expected_patch: PatchOperation[] = [ { op: 'replace', path: '', value: 'b' } ]

    checkRoundtrip(input, output, expected_patch)
});

it("issues/35", () => {
    const input = {name: "bob", image: undefined, cat: null};
    const output = {name: "bob", image: "foo.jpg", cat: "nikko"};
    const expected_patch: PatchOperation[] = [
        {op: "replace", path: "/cat", value: "nikko"},
        {op: "replace", path: "/image", value: "foo.jpg"},
    ];

    checkRoundtrip(input, output, expected_patch);
});

it("issues/36", () => {
    const input = [undefined, "B"]; // same as: const input = ['A', 'B']; delete input[0]
    const output = ["A", "B"];
    const expected_patch: PatchOperation[] = [
        // could also be {op: 'add', ...} -- the spec isn't clear on what constitutes existence for arrays
        {op: "replace", path: "/0", value: "A"},
    ];
    checkRoundtrip(input, output, expected_patch);
});

