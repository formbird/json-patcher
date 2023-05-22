import {applyPatch} from '..'

test('broken add', () => {
    const user = {id: 'chbrown'}
    expect(() => {
        applyPatch(user, [
            {op: 'add', path: '/a/b', value: 1},
        ])
    }).toThrow()
})

test('broken remove', () => {
    const user = {id: 'chbrown'}
    expect(() => {
        applyPatch(user, [
            {op: 'remove', path: '/name'},
        ])
    }).toThrow()

})

test('broken replace', () => {
    const user = {id: 'chbrown'}
    expect(() => {
        applyPatch(user, [
            {op: 'replace', path: '/name', value: 1},
        ])
    }).toThrow()
})

test('broken replace (array)', () => {
    const users = [{id: 'chbrown'}]
    expect(() => {
        applyPatch(users, [
            {op: 'replace', path: '/1', value: {id: 'chbrown2'}},
        ])
    }).toThrow()
})

test('broken move (from)', () => {
    const user = {id: 'chbrown'}
    expect(() => {
        applyPatch(user, [
            {op: 'move', from: '/name', path: '/id'},
        ])
    }).toThrow()
})

test('broken move (path)', () => {
    const user = {id: 'chbrown'}
    expect(() => {
        applyPatch(user, [
            {op: 'move', from: '/id', path: '/a/b'},
        ])
    }).toThrow()
})

test('broken copy (from)', () => {
    const user = {id: 'chbrown'}
    expect(() => {
        applyPatch(user, [
            {op: 'copy', from: '/name', path: '/id'},
        ])
    }).toThrow()
})

test('broken copy (path)', () => {
    const user = {id: 'chbrown'}
    expect(() => {
        applyPatch(user, [
            {op: 'copy', from: '/id', path: '/a/b'},
        ])
    }).toThrow()
})
