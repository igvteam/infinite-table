import { describe, it, expect, vi } from 'vitest'
import GenericDataSource from '../src/genericDataSource.js'

// Stub stringLoader — stands in for network I/O
function fakeLoader(responseText) {
    return {
        loadString: vi.fn().mockResolvedValue(responseText),
        loadJson: vi.fn().mockImplementation(() => {
            return Promise.resolve(JSON.parse(responseText))
        }),
    }
}

// ── getExtension (static, pure) ──────────────────────────────────────

describe('GenericDataSource.getExtension', () => {

    it('returns extension from simple filename', () => {
        expect(GenericDataSource.getExtension('data.csv')).toBe('csv')
    })

    it('returns extension from URL with path', () => {
        expect(GenericDataSource.getExtension('https://example.com/path/file.tab')).toBe('tab')
    })

    it('strips query parameters (Dropbox-style URLs)', () => {
        expect(GenericDataSource.getExtension('https://dropbox.com/file.json?dl=1')).toBe('json')
    })

    it('lowercases the extension', () => {
        expect(GenericDataSource.getExtension('FILE.TSV')).toBe('tsv')
    })

    it('handles File objects by reading .name', () => {
        const file = new File([''], 'report.csv')
        expect(GenericDataSource.getExtension(file)).toBe('csv')
    })

    it('returns full name when no dot is present', () => {
        expect(GenericDataSource.getExtension('nodot')).toBe('nodot')
    })
})

// ── parseTabData (instance method, pure logic via dataWrapper) ───────

describe('parseTabData', () => {

    it('parses tab-delimited string into array of objects', () => {
        const tsv = 'Name\tAge\nAlice\t30\nBob\t25'
        const ds = new GenericDataSource({ columns: ['Name', 'Age'] })
        const result = ds.parseTabData(tsv)
        expect(result).toEqual([
            { Name: 'Alice', Age: '30' },
            { Name: 'Bob', Age: '25' },
        ])
    })

    it('trims whitespace from headers and values', () => {
        const tsv = ' Name \t Age \n Alice \t 30 '
        const ds = new GenericDataSource({ columns: ['Name', 'Age'] })
        const result = ds.parseTabData(tsv)
        expect(result).toEqual([{ Name: 'Alice', Age: '30' }])
    })

    it('applies filter when provided', () => {
        const tsv = 'Name\tAge\nAlice\t30\nBob\t25\nCarol\t30'
        const ds = new GenericDataSource({ columns: ['Name', 'Age'] })
        const result = ds.parseTabData(tsv, r => r.Age === '30')
        expect(result).toEqual([
            { Name: 'Alice', Age: '30' },
            { Name: 'Carol', Age: '30' },
        ])
    })

    it('throws when column count mismatches header count', () => {
        const tsv = 'A\tB\n1\t2\t3'
        const ds = new GenericDataSource({ columns: ['A', 'B'] })
        expect(() => ds.parseTabData(tsv)).toThrow('Number of values must equal number of headers')
    })
})

// ── tableColumns ─────────────────────────────────────────────────────

describe('tableColumns', () => {

    it('returns the configured columns', async () => {
        const ds = new GenericDataSource({ columns: ['A', 'B'] })
        expect(await ds.tableColumns()).toEqual(['A', 'B'])
    })
})

// ── tableData — pre-set data array ───────────────────────────────────

describe('tableData — inline data', () => {

    it('returns the data array directly', async () => {
        const rows = [{ id: 1 }, { id: 2 }]
        const ds = new GenericDataSource({ columns: ['id'], data: rows })
        expect(await ds.tableData()).toBe(rows)
    })
})

// ── tableData — URL with stringLoader stub ───────────────────────────

describe('tableData — URL loading', () => {

    it('loads and parses tab-delimited data from URL', async () => {
        const tsv = 'Name\tAge\nAlice\t30'
        const loader = fakeLoader(tsv)
        const ds = new GenericDataSource({
            columns: ['Name', 'Age'],
            url: 'https://example.com/data.tab',
            igvxhr: loader,
        })
        const result = await ds.tableData()
        expect(loader.loadString).toHaveBeenCalledWith('https://example.com/data.tab')
        expect(result).toEqual([{ Name: 'Alice', Age: '30' }])
    })

    it('loads and parses JSON from URL when isJSON is true', async () => {
        const json = JSON.stringify([{ Name: 'Alice' }, { Name: 'Bob' }])
        const loader = fakeLoader(json)
        const ds = new GenericDataSource({
            columns: ['Name'],
            url: 'https://example.com/data.json',
            isJSON: true,
            igvxhr: loader,
        })
        const result = await ds.tableData()
        expect(result).toEqual([{ Name: 'Alice' }, { Name: 'Bob' }])
    })

    it('applies filter to JSON data', async () => {
        const json = JSON.stringify([{ n: 'A', v: 1 }, { n: 'B', v: 2 }])
        const loader = fakeLoader(json)
        const ds = new GenericDataSource({
            columns: ['n', 'v'],
            url: 'https://example.com/data.json',
            isJSON: true,
            filter: r => r.v > 1,
            igvxhr: loader,
        })
        const result = await ds.tableData()
        expect(result).toEqual([{ n: 'B', v: 2 }])
    })

    it('applies sort function', async () => {
        const json = JSON.stringify([{ n: 'C' }, { n: 'A' }, { n: 'B' }])
        const loader = fakeLoader(json)
        const ds = new GenericDataSource({
            columns: ['n'],
            url: 'https://example.com/data.json',
            isJSON: true,
            sort: (a, b) => a.n.localeCompare(b.n),
            igvxhr: loader,
        })
        const result = await ds.tableData()
        expect(result).toEqual([{ n: 'A' }, { n: 'B' }, { n: 'C' }])
    })

    it('uses custom parser when provided', async () => {
        const loader = fakeLoader('raw-text')
        const parser = { parse: vi.fn().mockReturnValue([{ custom: true }]) }
        const ds = new GenericDataSource({
            columns: ['custom'],
            url: 'https://example.com/data.txt',
            parser,
            igvxhr: loader,
        })
        const result = await ds.tableData()
        expect(parser.parse).toHaveBeenCalledWith('raw-text')
        expect(result).toEqual([{ custom: true }])
    })

    it('returns undefined when loadString fails', async () => {
        const loader = { loadString: vi.fn().mockRejectedValue(new Error('network')) }
        const ds = new GenericDataSource({
            columns: ['A'],
            url: 'https://example.com/data.tab',
            igvxhr: loader,
        })
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const result = await ds.tableData()
        expect(result).toBeUndefined()
        consoleSpy.mockRestore()
    })
})

// ── tableData — file-path style data with extension detection ────────

describe('tableData — file-path data string', () => {

    it('loads CSV file and parses into objects', async () => {
        const csv = 'Name,Age\nAlice,30\nBob,25'
        const loader = fakeLoader(csv)
        const ds = new GenericDataSource({
            columns: ['Name', 'Age'],
            data: 'data.csv',
            igvxhr: loader,
        })
        const result = await ds.tableData()
        expect(loader.loadString).toHaveBeenCalledWith('data.csv')
        expect(result).toEqual([
            { Name: 'Alice', Age: '30' },
            { Name: 'Bob', Age: '25' },
        ])
    })

    it('loads JSON file and returns parsed objects', async () => {
        const json = JSON.stringify([{ id: 1 }])
        const loader = fakeLoader(json)
        const ds = new GenericDataSource({
            columns: ['id'],
            data: 'data.json',
            igvxhr: loader,
        })
        const result = await ds.tableData()
        expect(loader.loadJson).toHaveBeenCalledWith('data.json')
        expect(result).toEqual([{ id: 1 }])
    })

    it('loads tab file and parses into objects', async () => {
        const tsv = 'Name\tAge\nAlice\t30'
        const loader = fakeLoader(tsv)
        const ds = new GenericDataSource({
            columns: ['Name', 'Age'],
            data: 'data.tab',
            igvxhr: loader,
        })
        const result = await ds.tableData()
        expect(result).toEqual([{ Name: 'Alice', Age: '30' }])
    })
})
