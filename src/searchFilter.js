import { createElement } from './domUtils.js'

/**
 * Real-time debounced search/filter across all visible columns.
 * Pre-computes concatenated lowercase search strings per row for performance.
 */
function createSearchFilter({ columns, debounceMs = 200, onFilterChange }) {

    let allData = []
    let searchStrings = []  // Pre-computed lowercase concatenations
    let filteredIndices = null  // null = no filter active
    let debounceTimer = null

    const input = createElement('input', {
        className: 'infinite-table__search',
        type: 'text',
        placeholder: 'Search...'
    })

    input.addEventListener('input', () => {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(applyFilter, debounceMs)
    })

    function precomputeSearchStrings(data) {
        searchStrings = data.map(row => {
            const parts = []
            for (const col of columns) {
                const val = row[col]
                if (val !== undefined && val !== null) {
                    parts.push(String(val).toLowerCase())
                }
            }
            return parts.join(' ')
        })
    }

    function applyFilter() {
        const query = input.value.trim().toLowerCase()
        if (query === '') {
            filteredIndices = null
        } else {
            filteredIndices = []
            for (let i = 0; i < searchStrings.length; i++) {
                if (searchStrings[i].includes(query)) {
                    filteredIndices.push(i)
                }
            }
        }
        if (onFilterChange) {
            onFilterChange(filteredIndices)
        }
    }

    function getElement() {
        return input
    }

    function setData(data) {
        allData = data
        precomputeSearchStrings(data)
        // Reapply current filter if any
        if (input.value.trim() !== '') {
            applyFilter()
        } else {
            filteredIndices = null
        }
    }

    function getFilteredData() {
        if (filteredIndices === null) return allData
        return filteredIndices.map(i => allData[i])
    }

    function getFilteredIndices() {
        return filteredIndices
    }

    function clear() {
        input.value = ''
        filteredIndices = null
        if (debounceTimer) clearTimeout(debounceTimer)
    }

    function destroy() {
        if (debounceTimer) clearTimeout(debounceTimer)
        if (input.parentNode) input.parentNode.removeChild(input)
    }

    return { getElement, setData, getFilteredData, getFilteredIndices, clear, destroy }
}

export { createSearchFilter }
