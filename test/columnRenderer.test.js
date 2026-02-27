// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { createColumnRenderer } from '../src/columnRenderer.js'

const columns = ['Name', 'Age', 'City']

describe('getDisplayTitle', () => {

    it('returns column name when no columnDefs', () => {
        const cr = createColumnRenderer({ columns })
        expect(cr.getDisplayTitle('Name')).toBe('Name')
    })

    it('returns column name when columnDefs has no entry for that column', () => {
        const cr = createColumnRenderer({ columns, columnDefs: { Age: { title: 'Years' } } })
        expect(cr.getDisplayTitle('Name')).toBe('Name')
    })

    it('returns title override from columnDefs', () => {
        const cr = createColumnRenderer({ columns, columnDefs: { Name: { title: 'Full Name' } } })
        expect(cr.getDisplayTitle('Name')).toBe('Full Name')
    })
})

describe('renderHeaderRow', () => {

    it('creates a div with header-row class', () => {
        const cr = createColumnRenderer({ columns })
        const row = cr.renderHeaderRow()
        expect(row.tagName).toBe('DIV')
        expect(row.className).toBe('infinite-table__header-row')
    })

    it('sets grid display and template columns', () => {
        const cr = createColumnRenderer({ columns })
        const row = cr.renderHeaderRow()
        expect(row.style.display).toBe('grid')
        expect(row.style.gridTemplateColumns).toBe('repeat(3, minmax(120px, 1fr))')
    })

    it('creates one cell per column with display titles', () => {
        const cr = createColumnRenderer({
            columns,
            columnDefs: { Age: { title: 'Years Old' } }
        })
        const row = cr.renderHeaderRow()
        const cells = [...row.children]
        expect(cells.length).toBe(3)
        expect(cells[0].textContent).toBe('Name')
        expect(cells[1].textContent).toBe('Years Old')
        expect(cells[2].textContent).toBe('City')
    })

    it('cells have the cell class', () => {
        const cr = createColumnRenderer({ columns })
        const row = cr.renderHeaderRow()
        expect(row.children[0].className).toBe('infinite-table__cell')
    })
})

describe('renderDataRow', () => {

    const cr = createColumnRenderer({ columns })
    const rowData = { Name: 'Alice', Age: 30, City: 'Boston' }

    it('creates a div with row class', () => {
        const row = cr.renderDataRow(rowData, 0)
        expect(row.className).toContain('infinite-table__row')
    })

    it('sets grid display and template columns', () => {
        const row = cr.renderDataRow(rowData, 0)
        expect(row.style.display).toBe('grid')
        expect(row.style.gridTemplateColumns).toBe('repeat(3, minmax(120px, 1fr))')
    })

    it('sets data-index attribute', () => {
        const row = cr.renderDataRow(rowData, 5)
        expect(row.dataset.index).toBe('5')
    })

    it('adds --even class on even indices', () => {
        const row0 = cr.renderDataRow(rowData, 0)
        const row1 = cr.renderDataRow(rowData, 1)
        const row2 = cr.renderDataRow(rowData, 2)
        expect(row0.classList.contains('infinite-table__row--even')).toBe(true)
        expect(row1.classList.contains('infinite-table__row--even')).toBe(false)
        expect(row2.classList.contains('infinite-table__row--even')).toBe(true)
    })

    it('fills cells with stringified column values', () => {
        const row = cr.renderDataRow(rowData, 0)
        const cells = [...row.children]
        expect(cells[0].textContent).toBe('Alice')
        expect(cells[1].textContent).toBe('30')
        expect(cells[2].textContent).toBe('Boston')
    })

    it('sets title attribute on each cell', () => {
        const row = cr.renderDataRow(rowData, 0)
        expect(row.children[0].title).toBe('Alice')
    })

    it('renders empty string for null and undefined values', () => {
        const row = cr.renderDataRow({ Name: null, Age: undefined, City: 'X' }, 0)
        const cells = [...row.children]
        expect(cells[0].textContent).toBe('')
        expect(cells[1].textContent).toBe('')
        expect(cells[2].textContent).toBe('X')
    })
})

describe('updateDataRow', () => {

    const columns = ['Name', 'City']
    const cr = createColumnRenderer({ columns })

    it('updates cell text and title', () => {
        const row = cr.renderDataRow({ Name: 'Alice', City: 'Boston' }, 0)
        cr.updateDataRow(row, { Name: 'Bob', City: 'Denver' }, 1)
        expect(row.children[0].textContent).toBe('Bob')
        expect(row.children[1].textContent).toBe('Denver')
        expect(row.children[0].title).toBe('Bob')
    })

    it('updates data-index', () => {
        const row = cr.renderDataRow({ Name: 'A', City: 'B' }, 0)
        cr.updateDataRow(row, { Name: 'A', City: 'B' }, 7)
        expect(row.dataset.index).toBe('7')
    })

    it('toggles --even class based on new index', () => {
        const row = cr.renderDataRow({ Name: 'A', City: 'B' }, 0)
        expect(row.classList.contains('infinite-table__row--even')).toBe(true)
        cr.updateDataRow(row, { Name: 'A', City: 'B' }, 3)
        expect(row.classList.contains('infinite-table__row--even')).toBe(false)
        cr.updateDataRow(row, { Name: 'A', City: 'B' }, 4)
        expect(row.classList.contains('infinite-table__row--even')).toBe(true)
    })

    it('removes selected class', () => {
        const row = cr.renderDataRow({ Name: 'A', City: 'B' }, 0)
        row.classList.add('infinite-table__row--selected')
        cr.updateDataRow(row, { Name: 'A', City: 'B' }, 0)
        expect(row.classList.contains('infinite-table__row--selected')).toBe(false)
    })

    it('handles null/undefined values', () => {
        const row = cr.renderDataRow({ Name: 'A', City: 'B' }, 0)
        cr.updateDataRow(row, { Name: null, City: undefined }, 0)
        expect(row.children[0].textContent).toBe('')
        expect(row.children[1].textContent).toBe('')
    })
})
