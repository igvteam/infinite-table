// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSearchFilter } from '../src/searchFilter.js'

const sampleData = [
    { Name: 'Alice', City: 'Boston' },
    { Name: 'Bob', City: 'Denver' },
    { Name: 'Carol', City: 'Boston' },
    { Name: 'Dave', City: 'Austin' },
]
const columns = ['Name', 'City']

// Helper: set input value and fire the filter synchronously (bypass debounce)
function typeAndFilter(sf, query) {
    const input = sf.getElement()
    input.value = query
    // Fire input event with 0 debounce — tests create with debounceMs: 0
    input.dispatchEvent(new Event('input'))
}

describe('searchFilter — setup', () => {

    it('getElement returns an input element', () => {
        const sf = createSearchFilter({ columns })
        expect(sf.getElement().tagName).toBe('INPUT')
    })

    it('input has search class and placeholder', () => {
        const sf = createSearchFilter({ columns })
        const input = sf.getElement()
        expect(input.className).toBe('infinite-table__search')
        expect(input.placeholder).toBe('Search...')
    })
})

describe('searchFilter — filtering', () => {

    let sf, cb

    beforeEach(() => {
        cb = vi.fn()
        sf = createSearchFilter({ columns, debounceMs: 0, onFilterChange: cb })
        sf.setData(sampleData)
    })

    it('no filter active initially — getFilteredIndices returns null', () => {
        expect(sf.getFilteredIndices()).toBeNull()
    })

    it('no filter active — getFilteredData returns all data', () => {
        expect(sf.getFilteredData()).toBe(sampleData)
    })

    it('filters rows matching query across columns', async () => {
        typeAndFilter(sf, 'boston')
        await vi.waitFor(() => {
            expect(sf.getFilteredIndices()).toEqual([0, 2])
        })
    })

    it('getFilteredData returns matching row objects', async () => {
        typeAndFilter(sf, 'boston')
        await vi.waitFor(() => {
            expect(sf.getFilteredData()).toEqual([sampleData[0], sampleData[2]])
        })
    })

    it('search is case-insensitive', async () => {
        typeAndFilter(sf, 'ALICE')
        await vi.waitFor(() => {
            expect(sf.getFilteredIndices()).toEqual([0])
        })
    })

    it('empty query resets filter to null', async () => {
        typeAndFilter(sf, 'boston')
        await vi.waitFor(() => {
            expect(sf.getFilteredIndices()).toEqual([0, 2])
        })
        typeAndFilter(sf, '')
        await vi.waitFor(() => {
            expect(sf.getFilteredIndices()).toBeNull()
        })
    })

    it('whitespace-only query resets filter to null', async () => {
        typeAndFilter(sf, '   ')
        await vi.waitFor(() => {
            expect(sf.getFilteredIndices()).toBeNull()
        })
    })

    it('fires onFilterChange with indices on match', async () => {
        typeAndFilter(sf, 'dave')
        await vi.waitFor(() => {
            expect(cb).toHaveBeenCalledWith([3])
        })
    })

    it('fires onFilterChange with null when query cleared', async () => {
        typeAndFilter(sf, 'dave')
        await vi.waitFor(() => {
            expect(cb).toHaveBeenCalledWith([3])
        })
        typeAndFilter(sf, '')
        await vi.waitFor(() => {
            expect(cb).toHaveBeenCalledWith(null)
        })
    })

    it('no matches returns empty array', async () => {
        typeAndFilter(sf, 'zzzzz')
        await vi.waitFor(() => {
            expect(sf.getFilteredIndices()).toEqual([])
        })
    })
})

describe('searchFilter — setData', () => {

    it('reapplies current filter when data changes', async () => {
        const sf = createSearchFilter({ columns, debounceMs: 0 })
        sf.setData(sampleData)
        typeAndFilter(sf, 'boston')
        await vi.waitFor(() => {
            expect(sf.getFilteredIndices()).toEqual([0, 2])
        })

        // New data with different rows
        const newData = [
            { Name: 'Eve', City: 'Boston' },
            { Name: 'Frank', City: 'Miami' },
        ]
        sf.setData(newData)
        // Filter should have been reapplied to new data
        expect(sf.getFilteredIndices()).toEqual([0])
        expect(sf.getFilteredData()).toEqual([newData[0]])
    })
})

describe('searchFilter — clear', () => {

    it('clears input value and resets filter', async () => {
        const sf = createSearchFilter({ columns, debounceMs: 0 })
        sf.setData(sampleData)
        typeAndFilter(sf, 'boston')
        await vi.waitFor(() => {
            expect(sf.getFilteredIndices()).toEqual([0, 2])
        })

        sf.clear()
        expect(sf.getElement().value).toBe('')
        expect(sf.getFilteredIndices()).toBeNull()
    })
})

describe('searchFilter — handles null/undefined values', () => {

    it('skips null and undefined column values without error', async () => {
        const data = [
            { Name: 'Alice', City: null },
            { Name: undefined, City: 'Denver' },
            { Name: 'Carol', City: 'Boston' },
        ]
        const sf = createSearchFilter({ columns, debounceMs: 0 })
        sf.setData(data)
        typeAndFilter(sf, 'denver')
        await vi.waitFor(() => {
            expect(sf.getFilteredIndices()).toEqual([1])
        })
    })
})

describe('searchFilter — destroy', () => {

    it('removes element from parent if attached', () => {
        const sf = createSearchFilter({ columns })
        const parent = document.createElement('div')
        parent.appendChild(sf.getElement())
        expect(parent.children.length).toBe(1)
        sf.destroy()
        expect(parent.children.length).toBe(0)
    })
})
