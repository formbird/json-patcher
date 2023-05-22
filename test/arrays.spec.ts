import {applyPatch} from '..'
import {createParsedPatch as createPatch} from "./_index";


const pairs = [
  [
    ['A', 'Z', 'Z'],
    ['A'],
  ],
  [
    ['A', 'B'],
    ['B', 'A'],
  ],
  [
    [],
    ['A', 'B'],
  ],
  [
    ['B', 'A', 'M'],
    ['M', 'A', 'A'],
  ],
  [
    ['A', 'A', 'R'],
    [],
  ],
  [
    ['A', 'B', 'C'],
    ['B', 'C', 'D'],
  ],
  [
    ['A', 'C'],
    ['A', 'B', 'C'],
  ],
  [
    ['A', 'B', 'C'],
    ['A', 'Z'],
  ],
]


pairs.forEach(([input, output]) => {
  test(`diff+patch: [${input}] => [${output}]`, () => {
    const patch = createPatch(input, output)
    const actualOutput = applyPatch(input, patch)
    expect(actualOutput).toEqual(output)
  })
})
