import {createPatch} from '..'

export function createParsedPatch(input: any, output: any) {
  const patch = createPatch(input, output)
  return JSON.parse(patch)
}
