import {applyPatch, type PatchOperation} from "..";
import { createParsedPatch as createPatch } from './_index'

function checkRoundtrip(
    input: any,
    output: any,
    expected_patch: PatchOperation[],
    actual_patch: PatchOperation[] = createPatch(input, output)
) {
    expect(actual_patch).toEqual(expected_patch);
    const actualOutput = applyPatch(input, actual_patch);
    expect(actualOutput).toEqual(output);
}

test("issues/3", () => {
    const input = {arr: ["1", "2", "2"]};
    const output = {arr: ["1"]};
    const expected_patch: PatchOperation[] = [
        {op: "remove", path: "/arr/1"},
        {op: "remove", path: "/arr/1"},
    ];
    checkRoundtrip(input, output, expected_patch);
});

test("issues/4", () => {
    const input = ["A", "B"];
    const output = ["B", "A"];
    const expected_patch: PatchOperation[] = [
        {op: "replace", path: "/0", value: "B"},
        {op: "replace", path: "/1", value: "A"},
    ];

    checkRoundtrip(input, output, expected_patch);
});

test("issues/5", () => {
    const input: string[] = [];
    const output = ["A", "B"];
    const expected_patch: PatchOperation[] = [
        {op: "add", path: "/0", value: "A"},
        {op: "add", path: "/1", value: "B"},
    ];

    checkRoundtrip(input, output, expected_patch);
});

test("issues/9", () => {
    const input = [{A: 1, B: 2}, {C: 3}];
    const output = [{A: 1, B: 20}, {C: 3}];
    const expected_patch: PatchOperation[] = [
        {op: "replace", path: "/0/B", value: 20},
    ];

    checkRoundtrip(input, output, expected_patch);
});

test("issues/12", () => {
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

test("issues/15", () => {
    const input = {date: new Date(0)};
    const output = {date: '1970-01-01T00:00:00.001+00:00'};
    const expected_patch: PatchOperation[] = [
        { op: 'replace', path: '/date', value: '1970-01-01T00:00:00.001+00:00' }
    ];

    checkRoundtrip(input, output, expected_patch);
});

test("issues/15/array", () => {
    const input = [new Date(0)];
    const output = ['1970-01-01T00:00:00.001+00:00'];
    const expected_patch: PatchOperation[] = [
        {op: "replace", path: "/0", value: '1970-01-01T00:00:00.001+00:00'},
    ];

    checkRoundtrip(input, output, expected_patch);
});

test("issues/32", () => {
    const input = "a";
    const output = "b";
    const expected_patch: PatchOperation[] = [ { op: 'replace', path: '', value: 'b' } ]

    checkRoundtrip(input, output, expected_patch)
});

test("issues/35", () => {
    const input = {name: "bob", image: undefined, cat: null};
    const output = {name: "bob", image: "foo.jpg", cat: "nikko"};
    const expected_patch: PatchOperation[] = [
        {op: "replace", path: "/cat", value: "nikko"},
        {op: "replace", path: "/image", value: "foo.jpg"},
    ];

    checkRoundtrip(input, output, expected_patch);
});

test("issues/36", () => {
    const input = [undefined, "B"]; // same as: const input = ['A', 'B']; delete input[0]
    const output = ["A", "B"];
    const expected_patch: PatchOperation[] = [
        // could also be {op: 'add', ...} -- the spec isn't clear on what constitutes existence for arrays
        {op: "replace", path: "/0", value: "A"},
    ];
    checkRoundtrip(input, output, expected_patch);
});

/*
test('issues/37', t => {
  const value = {id: 'chbrown'}
  const patch_results = applyPatch(value, [
    {op: 'copy', from: '/id', path: '/name'},
  ])
  const expected_value = {id: 'chbrown', name: 'chbrown'}
  t.deepEqual(value, expected_value, 'should apply patch to arrive at output')
  t.true(patch_results.every(result => result == null), 'should apply patch successfully')
})

test('issues/38', t => {
  const value = {
    current: {timestamp: 23},
    history: [],
  }
  const patch_results = applyPatch(value, [
    {op: 'copy',    from: '/current', path: '/history/-'},
    {op: 'replace', path: '/current/timestamp', value: 24},
    {op: 'copy',    from: '/current', path: '/history/-'},
  ])
  const expected_value = {
    current: {timestamp: 24},
    history: [
      {timestamp: 23},
      {timestamp: 24},
    ],
  }
  t.deepEqual(value, expected_value, 'should apply patch to arrive at output')
  t.true(patch_results.every(result => result == null), 'should apply patch successfully')
})

test('issues/44', t => {
  const value = {}
  const author = {firstName: 'Chris'}
  const patch_results = applyPatch(value, [
    {op: 'add', path: '/author', value: author},
    {op: 'add', path: '/author/lastName', value: 'Brown'},
  ])
  const expected_value = {
    author: {firstName: 'Chris', lastName: 'Brown'},
  }
  t.deepEqual(value, expected_value, 'should apply patch to arrive at output')
  t.true(patch_results.every(result => result == null), 'should apply patch successfully')
  t.deepEqual(author, {firstName: 'Chris'}, 'patch reference should not be changed')
})

test('issues/76', t => {
  t.true(({} as any).polluted === undefined, 'Object prototype should not be polluted')
  const value = {}
  applyPatch(value, [
    {op: 'add', path: '/__proto__/polluted', value: 'Hello!'}
  ])
  t.true(({} as any).polluted === undefined, 'Object prototype should still not be polluted')
})

test('issues/78', t => {
  const user = {firstName: 'Chris'}
  const patch_results = applyPatch(user, [
    {op: 'add', path: '/createdAt', value: new Date('2010-08-10T22:10:48Z')},
  ])
  t.true(patch_results.every(result => result == null), 'should apply patch successfully')
  t.deepEqual(user['createdAt'].getTime(), 1281478248000, 'should add Date recoverably')
})
*/
