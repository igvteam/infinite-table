import { createElement, div } from './domUtils.js'

/**
 * Renders header and data cells from column configuration.
 * Handles columnDefs title overrides (e.g. AssayType -> "Assay Type").
 */
function createColumnRenderer({ columns, columnDefs }) {

    const gridTemplate = `repeat(${columns.length}, minmax(120px, 1fr))`

    function getDisplayTitle(column) {
        if (columnDefs && columnDefs[column] && columnDefs[column].title) {
            return columnDefs[column].title
        }
        return column
    }

    function renderHeaderRow() {
        const row = div('infinite-table__header-row')
        row.style.display = 'grid'
        row.style.gridTemplateColumns = gridTemplate
        for (const col of columns) {
            const cell = div('infinite-table__cell')
            cell.textContent = getDisplayTitle(col)
            row.appendChild(cell)
        }
        return row
    }

    function renderDataRow(rowData, index) {
        const row = div('infinite-table__row')
        row.style.display = 'grid'
        row.style.gridTemplateColumns = gridTemplate
        row.dataset.index = index
        if (index % 2 === 0) {
            row.classList.add('infinite-table__row--even')
        }
        for (const col of columns) {
            const cell = div('infinite-table__cell')
            const value = rowData[col]
            cell.textContent = value !== undefined && value !== null ? String(value) : ''
            cell.title = cell.textContent
            row.appendChild(cell)
        }
        return row
    }

    function updateDataRow(rowEl, rowData, index) {
        rowEl.dataset.index = index
        rowEl.classList.toggle('infinite-table__row--even', index % 2 === 0)
        rowEl.classList.remove('infinite-table__row--selected')
        const cells = rowEl.children
        for (let i = 0; i < columns.length; i++) {
            const value = rowData[columns[i]]
            const text = value !== undefined && value !== null ? String(value) : ''
            cells[i].textContent = text
            cells[i].title = text
        }
    }

    function destroy() {
        // No persistent state to clean up
    }

    return { renderHeaderRow, renderDataRow, updateDataRow, getDisplayTitle, destroy }
}

export { createColumnRenderer }
