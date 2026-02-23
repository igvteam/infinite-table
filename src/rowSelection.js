/**
 * Tracks selected indices. Supports single and multi modes.
 * Multi: plain click = select one, Shift+click = range, Ctrl/Cmd+click = toggle.
 * Single: click always selects exactly one row.
 */
function createRowSelection({ mode = 'multi', onSelectionChange }) {

    const selected = new Set()
    let anchor = null  // For shift+click range selection

    function handleRowClick(index, event) {
        if (mode === 'single') {
            selected.clear()
            selected.add(index)
            anchor = index
        } else {
            // Multi mode
            if (event && event.shiftKey && anchor !== null) {
                // Range select from anchor to index
                const start = Math.min(anchor, index)
                const end = Math.max(anchor, index)
                selected.clear()
                for (let i = start; i <= end; i++) {
                    selected.add(i)
                }
            } else if (event && (event.ctrlKey || event.metaKey)) {
                // Toggle
                if (selected.has(index)) {
                    selected.delete(index)
                } else {
                    selected.add(index)
                }
                anchor = index
            } else {
                // Plain click — select one
                selected.clear()
                selected.add(index)
                anchor = index
            }
        }

        if (onSelectionChange) {
            onSelectionChange(getSelectedIndices())
        }
    }

    function getSelectedIndices() {
        return Array.from(selected).sort((a, b) => a - b)
    }

    function getSelectedData(data) {
        return getSelectedIndices().map(i => data[i]).filter(d => d !== undefined)
    }

    function clearSelection() {
        selected.clear()
        anchor = null
        if (onSelectionChange) {
            onSelectionChange([])
        }
    }

    function isSelected(index) {
        return selected.has(index)
    }

    function destroy() {
        selected.clear()
        anchor = null
    }

    return { handleRowClick, getSelectedIndices, getSelectedData, clearSelection, isSelected, destroy }
}

export { createRowSelection }
