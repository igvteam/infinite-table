// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { createElement, removeChildren, div } from '../src/domUtils.js'

describe('createElement', () => {

    it('creates an element with the given tag', () => {
        const el = createElement('span')
        expect(el.tagName).toBe('SPAN')
    })

    it('sets className', () => {
        const el = createElement('div', { className: 'foo bar' })
        expect(el.className).toBe('foo bar')
    })

    it('sets textContent', () => {
        const el = createElement('p', { textContent: 'hello' })
        expect(el.textContent).toBe('hello')
    })

    it('sets innerHTML', () => {
        const el = createElement('div', { innerHTML: '<b>bold</b>' })
        expect(el.innerHTML).toBe('<b>bold</b>')
    })

    it('sets arbitrary attributes via setAttribute', () => {
        const el = createElement('input', { type: 'text', placeholder: 'Name' })
        expect(el.getAttribute('type')).toBe('text')
        expect(el.getAttribute('placeholder')).toBe('Name')
    })

    it('applies inline styles', () => {
        const el = createElement('div', {}, { color: 'red', fontSize: '14px' })
        expect(el.style.color).toBe('red')
        expect(el.style.fontSize).toBe('14px')
    })

    it('handles empty attributes and styles', () => {
        const el = createElement('div')
        expect(el.tagName).toBe('DIV')
        expect(el.className).toBe('')
    })
})

describe('removeChildren', () => {

    it('removes all child nodes', () => {
        const parent = createElement('div')
        parent.appendChild(createElement('span'))
        parent.appendChild(createElement('span'))
        parent.appendChild(createElement('span'))
        expect(parent.childNodes.length).toBe(3)
        removeChildren(parent)
        expect(parent.childNodes.length).toBe(0)
    })

    it('does nothing on element with no children', () => {
        const parent = createElement('div')
        removeChildren(parent)
        expect(parent.childNodes.length).toBe(0)
    })
})

describe('div', () => {

    it('creates a div element', () => {
        const el = div()
        expect(el.tagName).toBe('DIV')
    })

    it('sets className when provided', () => {
        const el = div('my-class')
        expect(el.className).toBe('my-class')
    })

    it('applies styles when provided', () => {
        const el = div('cls', { display: 'flex' })
        expect(el.style.display).toBe('flex')
    })

    it('handles no className (undefined)', () => {
        const el = div(undefined, { color: 'blue' })
        expect(el.className).toBe('')
        expect(el.style.color).toBe('blue')
    })
})
