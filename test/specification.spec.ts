import {applyPatch, createPatch, type PatchOperation} from '..'
import spec_data from './specification'
import { expect } from 'chai'

function runCatching(spec: typeof spec_data[number], f: () => void) {
  if (spec.results.some(it => it?.includes('Error') === true)) {
    expect(() => f()).to.throw()
  } else {
    expect(() => f()).not.to.throw()
  }
}

it('Specification format', () => {
  expect(spec_data.length).to.equal(19)
  // use sorted values and sort() to emulate set equality
  const props = ['diffable', 'input', 'name', 'output', 'patch', 'results']
  spec_data.forEach(spec => {
    expect(Object.keys(spec).filter(it => it !== 'ignored').sort()).to.deep.equal(props)
  })
})

// take the input, apply the patch, and check the actual result against the
// expected output
spec_data.forEach(spec => {
  it(`patch ${spec.name}`, () => {
    // patch operations are applied to object in-place
    const expected = spec.output
    runCatching(spec, () => {
      const results = applyPatch(spec.input, spec.patch as PatchOperation[])
      expect(results).to.deep.equal(expected)
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
      expect(JSON.parse(actual)).to.deep.equal(expected)
    })
  })
})
