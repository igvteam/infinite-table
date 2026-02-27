import { createElement, div, removeChildren } from './domUtils.js'
import { createInfiniteTable } from './infiniteTable.js'

/**
 * Bootstrap 5 modal wrapper for InfiniteTable.
 * Drop-in replacement for data-modal's ModalTable.
 *
 * Public API mirrors ModalTable:
 *   modal, modalElement, setTitle, setDescription, remove,
 *   setDatasource, buildTable, getSelectedTableRowsData
 */
function createModalTable({ id, title, datasource, okHandler, selectionStyle, parent, description }) {

    let currentDatasource = datasource || null
    let infiniteTable = null
    let built = false

    const parentElement = parent || document.body

    // --- Create modal DOM ---

    const modalElement = createModalElement(id, title || '', description || '')
    parentElement.appendChild(modalElement)

    // Bootstrap modal instance
    const modal = new bootstrap.Modal(modalElement)

    // Containers
    const tableContainer = modalElement.querySelector(`#${CSS.escape(id)}-table-container`)
    const spinner = modalElement.querySelector(`#${CSS.escape(id)}-spinner`)

    // Lazy build on shown
    modalElement.addEventListener('shown.bs.modal', () => {
        buildTable()
    })

    // OK button handler
    const okButton = modalElement.querySelector('.modal-footer .btn-secondary')
    okButton.addEventListener('click', () => {
        const selected = getSelectedTableRowsData()
        if (selected && okHandler) {
            okHandler(selected)
        }
    })

    // Clear search keyword and selections on modal dismiss
    modalElement.addEventListener('hidden.bs.modal', () => {
        if (infiniteTable) {
            infiniteTable.clearSearch()
            infiniteTable.clearSelection()
        }
    })

    // --- Public methods ---

    function setTitle(newTitle) {
        const el = modalElement.querySelector('.modal-title')
        el.textContent = newTitle
    }

    function setDescription(html) {
        const descEl = modalElement.querySelector('.modal-body').firstElementChild
        descEl.innerHTML = html || ''
    }

    function remove() {
        if (infiniteTable) {
            infiniteTable.destroy()
            infiniteTable = null
        }
        modalElement.parentNode.removeChild(modalElement)
    }

    function setDatasource(ds) {
        currentDatasource = ds
        // Clear existing table so it rebuilds on next show
        if (infiniteTable) {
            infiniteTable.destroy()
            infiniteTable = null
        }
        removeChildren(tableContainer)
        built = false
    }

    async function buildTable() {
        if (built || !currentDatasource) return
        built = true

        startSpinner()

        try {
            const tableData = await currentDatasource.tableData()
            const tableColumns = await currentDatasource.tableColumns()
            const columnDefs = currentDatasource.columnDefs

            infiniteTable = createInfiniteTable({
                container: tableContainer,
                columns: tableColumns,
                columnDefs: columnDefs,
                selectionStyle: selectionStyle || 'multi'
            })

            if (typeof currentDatasource.rowHandler === 'function') {
                infiniteTable.setRowHandler(currentDatasource.rowHandler)
            }

            infiniteTable.setData(tableData)
        } finally {
            stopSpinner()
        }
    }

    function getSelectedTableRowsData() {
        if (!infiniteTable) return undefined

        const selectedData = infiniteTable.getSelectedData()
        if (!selectedData || selectedData.length === 0) return undefined

        const rowHandler = infiniteTable.getRowHandler()
        if (typeof rowHandler === 'function') {
            const columns = currentDatasource.columns || []
            return selectedData.map(row => {
                const transformed = rowHandler(row)
                // Attach metadata from visible columns
                const filteredKeys = Object.keys(row).filter(key => columns.includes(key))
                transformed.metadata = {}
                for (const key of filteredKeys) {
                    transformed.metadata[key] = row[key]
                }
                return transformed
            })
        }

        return selectedData
    }

    function startSpinner() {
        spinner.style.display = ''
    }

    function stopSpinner() {
        spinner.style.display = 'none'
    }

    return {
        modal,
        modalElement,
        setTitle,
        setDescription,
        remove,
        setDatasource,
        buildTable,
        getSelectedTableRowsData
    }
}

/**
 * Creates the Bootstrap 5 modal DOM structure.
 */
function createModalElement(id, title, description) {

    const modal = createElement('div', {
        id: id,
        className: 'modal fade',
        tabindex: '-1'
    })
    modal.setAttribute('aria-hidden', 'true')

    modal.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">${title}</div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div style="font-size: 0.9rem; padding-bottom: 0.75rem">${description}</div>
                    <div id="${id}-spinner" class="spinner-border" style="display: none;" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div id="${id}-table-container"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">OK</button>
                </div>
            </div>
        </div>`

    return modal
}

export { createModalTable }
