
import {join} from 'path'
import {readFileSync} from 'fs'
import * as yaml from 'js-yaml'

import {applyPatch, createPatch, type PatchOperation} from '..'

interface Spec {
  ignored: boolean;
  name: string
  input: any
  patch: PatchOperation[]
  output: any
  results: (string | null)[],
  diffable: boolean
}

const spec_data = yaml.load(readFileSync(join(__dirname, 'specification.yaml'),
                                         {encoding: 'utf8'})) as Spec[]

function runCatching(spec: Spec, f: () => void) {
  if (spec.results.some(it => it?.includes('Error') === true)) {
    expect(() => f()).toThrow()
  } else {
    expect(() => f()).not.toThrow()
  }
}

it('Specification format', () => {
  expect(spec_data.length).toEqual(19)
  // use sorted values and sort() to emulate set equality
  const props = ['diffable', 'input', 'name', 'output', 'patch', 'results']
  spec_data.forEach(spec => {
    expect(Object.keys(spec).filter(it => it !== 'ignored').sort()).toEqual(props)
  })
})

// take the input, apply the patch, and check the actual result against the
// expected output
spec_data.forEach(spec => {
  it(`patch ${spec.name}`, () => {
    // patch operations are applied to object in-place
    const expected = spec.output
    runCatching(spec, () => {
      const results = applyPatch(spec.input, spec.patch)
      expect(results).toEqual(expected)
    })
  })
})

spec_data.filter(spec => spec.diffable).forEach(spec => {
  it(`diff ${spec.name}`, () => {
    if (spec.ignored) {
      return
    }

    // we read this separately because patch is destructive and it's easier just to start with a blank slate
    // ignore spec items that are marked as not diffable
    // perform diff (create patch = list of operations) and check result against non-test patches in spec
    runCatching(spec, () => {
      const actual = createPatch(spec.input, spec.output)
      const expected = spec.patch.filter(operation => operation.op !== 'test')
      expect(JSON.parse(actual)).toEqual(expected)
    })
  })
})
