import { expect } from 'chai'
import {applyPatch} from '..'

it('broken add', () => {
    const user = {id: 'chbrown'}
    expect(() => {
        applyPatch(user, [
            {op: 'add', path: '/a/b', value: 1},
        ])
    }).to.throw()
})

it('broken remove', () => {
    const user = {id: 'chbrown'}
    expect(() => {
        applyPatch(user, [
            {op: 'remove', path: '/name'},
        ])
    }).to.throw()

})

it('broken replace', () => {
    const user = {id: 'chbrown'}
    expect(() => {
        applyPatch(user, [
            {op: 'replace', path: '/name', value: 1},
        ])
    }).to.throw()
})

it('broken replace (array)', () => {
    const users = [{id: 'chbrown'}]
    expect(() => {
        applyPatch(users, [
            {op: 'replace', path: '/1', value: {id: 'chbrown2'}},
        ])
    }).to.throw()
})

it('broken move (from)', () => {
    const user = {id: 'chbrown'}
    expect(() => {
        applyPatch(user, [
            {op: 'move', from: '/name', path: '/id'},
        ])
    }).to.throw()
})

it('broken move (path)', () => {
    const user = {id: 'chbrown'}
    expect(() => {
        applyPatch(user, [
            {op: 'move', from: '/id', path: '/a/b'},
        ])
    }).to.throw()
})

it('broken copy (from)', () => {
    const user = {id: 'chbrown'}
    expect(() => {
        applyPatch(user, [
            {op: 'copy', from: '/name', path: '/id'},
        ])
    }).to.throw()
})

it('broken copy (path)', () => {
    const user = {id: 'chbrown'}
    expect(() => {
        applyPatch(user, [
            {op: 'copy', from: '/id', path: '/a/b'},
        ])
    }).to.throw()
})
