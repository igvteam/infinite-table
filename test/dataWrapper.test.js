import { describe, it, expect } from 'vitest'
import getDataWrapper from '../src/dataWrapper.js'

// Helper: collect all lines from a wrapper
function allLines(wrapper, method = 'nextLine') {
    const lines = []
    let line
    while ((line = wrapper[method]()) !== undefined) {
        lines.push(line)
    }
    return lines
}

describe('getDataWrapper — factory', () => {

    it('returns StringDataWrapper for a string', () => {
        const w = getDataWrapper('hello')
        expect(w.constructor.name).toBe('StringDataWrapper')
    })

    it('returns ByteArrayDataWrapper for a Uint8Array', () => {
        const w = getDataWrapper(new Uint8Array([72, 105]))
        expect(w.constructor.name).toBe('ByteArrayDataWrapper')
    })
})

describe('StringDataWrapper — nextLine', () => {

    it('parses lines separated by newline', () => {
        const w = getDataWrapper('aaa\nbbb\nccc')
        expect(allLines(w)).toEqual(['aaa', 'bbb', 'ccc'])
    })

    it('trims whitespace from each line', () => {
        const w = getDataWrapper('  foo  \n  bar  ')
        expect(allLines(w)).toEqual(['foo', 'bar'])
    })

    it('skips empty lines (returns undefined for blank between newlines)', () => {
        const w = getDataWrapper('aaa\n\nbbb')
        // First line is 'aaa', then the empty line at idx===start returns undefined,
        // but pointer advances so 'bbb' is still reachable
        const lines = []
        let line
        // Collect including undefined to see behavior
        for (let i = 0; i < 10; i++) {
            line = w.nextLine()
            if (line === undefined) break
            lines.push(line)
        }
        expect(lines).toEqual(['aaa'])
    })

    it('handles CRLF by trimming the CR', () => {
        const w = getDataWrapper('aaa\r\nbbb\r\nccc')
        expect(allLines(w)).toEqual(['aaa', 'bbb', 'ccc'])
    })

    it('returns undefined when exhausted', () => {
        const w = getDataWrapper('one')
        w.nextLine()
        expect(w.nextLine()).toBeUndefined()
    })

    it('handles empty string', () => {
        const w = getDataWrapper('')
        expect(w.nextLine()).toBeUndefined()
    })
})

describe('StringDataWrapper — nextLineNoTrim', () => {

    it('preserves leading and trailing whitespace', () => {
        const w = getDataWrapper('  foo  \n  bar  ')
        expect(allLines(w, 'nextLineNoTrim')).toEqual(['  foo  ', '  bar  '])
    })

    it('strips CR in CRLF but keeps other whitespace', () => {
        const w = getDataWrapper('  aaa  \r\n  bbb  ')
        expect(allLines(w, 'nextLineNoTrim')).toEqual(['  aaa  ', '  bbb  '])
    })

    it('returns empty string for blank lines (not undefined)', () => {
        const w = getDataWrapper('aaa\n\nbbb')
        const lines = allLines(w, 'nextLineNoTrim')
        expect(lines).toEqual(['aaa', '', 'bbb'])
    })

    it('returns undefined when exhausted', () => {
        const w = getDataWrapper('one')
        w.nextLineNoTrim()
        expect(w.nextLineNoTrim()).toBeUndefined()
    })
})

describe('ByteArrayDataWrapper — nextLine', () => {

    function toUint8(str) {
        return new Uint8Array([...str].map(c => c.charCodeAt(0)))
    }

    it('parses lines separated by newline', () => {
        const w = getDataWrapper(toUint8('aaa\nbbb\nccc'))
        expect(allLines(w)).toEqual(['aaa', 'bbb', 'ccc'])
    })

    it('strips CR characters', () => {
        const w = getDataWrapper(toUint8('aaa\r\nbbb\r\nccc'))
        expect(allLines(w)).toEqual(['aaa', 'bbb', 'ccc'])
    })

    it('returns empty string for blank lines', () => {
        const w = getDataWrapper(toUint8('aaa\n\nbbb'))
        expect(allLines(w)).toEqual(['aaa', '', 'bbb'])
    })

    it('returns undefined when exhausted', () => {
        const w = getDataWrapper(toUint8('one'))
        w.nextLine()
        expect(w.nextLine()).toBeUndefined()
    })

    it('handles empty array', () => {
        const w = getDataWrapper(new Uint8Array([]))
        expect(w.nextLine()).toBeUndefined()
    })
})

describe('ByteArrayDataWrapper — nextLineNoTrim', () => {

    it('is the same function as nextLine', () => {
        const w = getDataWrapper(new Uint8Array([65]))
        expect(w.nextLineNoTrim).toBe(w.nextLine)
    })
})
