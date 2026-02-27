import { describe, it, expect, vi } from 'vitest'
import { createRowSelection } from '../src/rowSelection.js'

describe('rowSelection — multi mode (default)', () => {

    it('clicking a row selects it', () => {
        const sel = createRowSelection({})
        sel.handleRowClick(2)
        expect(sel.getSelectedIndices()).toEqual([2])
    })

    it('clicking a selected row deselects it', () => {
        const sel = createRowSelection({})
        sel.handleRowClick(2)
        sel.handleRowClick(2)
        expect(sel.getSelectedIndices()).toEqual([])
    })

    it('multiple rows can be selected independently', () => {
        const sel = createRowSelection({})
        sel.handleRowClick(3)
        sel.handleRowClick(1)
        sel.handleRowClick(5)
        expect(sel.getSelectedIndices()).toEqual([1, 3, 5])
    })

    it('getSelectedIndices returns sorted order', () => {
        const sel = createRowSelection({})
        sel.handleRowClick(9)
        sel.handleRowClick(2)
        sel.handleRowClick(5)
        expect(sel.getSelectedIndices()).toEqual([2, 5, 9])
    })
})

describe('rowSelection — single mode', () => {

    it('clicking a row selects it', () => {
        const sel = createRowSelection({ mode: 'single' })
        sel.handleRowClick(4)
        expect(sel.getSelectedIndices()).toEqual([4])
    })

    it('clicking a selected row deselects it', () => {
        const sel = createRowSelection({ mode: 'single' })
        sel.handleRowClick(4)
        sel.handleRowClick(4)
        expect(sel.getSelectedIndices()).toEqual([])
    })

    it('clicking a different row replaces the previous selection', () => {
        const sel = createRowSelection({ mode: 'single' })
        sel.handleRowClick(1)
        sel.handleRowClick(3)
        expect(sel.getSelectedIndices()).toEqual([3])
    })
})

describe('getSelectedData', () => {

    it('maps selected indices to data array entries', () => {
        const sel = createRowSelection({})
        const data = ['a', 'b', 'c', 'd']
        sel.handleRowClick(0)
        sel.handleRowClick(2)
        expect(sel.getSelectedData(data)).toEqual(['a', 'c'])
    })

    it('skips out-of-bounds indices', () => {
        const sel = createRowSelection({})
        const data = ['a', 'b']
        sel.handleRowClick(0)
        sel.handleRowClick(99)
        expect(sel.getSelectedData(data)).toEqual(['a'])
    })
})

describe('clearSelection', () => {

    it('clears all selections', () => {
        const sel = createRowSelection({})
        sel.handleRowClick(1)
        sel.handleRowClick(2)
        sel.clearSelection()
        expect(sel.getSelectedIndices()).toEqual([])
    })

    it('fires onSelectionChange with empty array', () => {
        const cb = vi.fn()
        const sel = createRowSelection({ onSelectionChange: cb })
        sel.handleRowClick(1)
        cb.mockClear()
        sel.clearSelection()
        expect(cb).toHaveBeenCalledWith([])
    })
})

describe('isSelected', () => {

    it('returns true for selected index', () => {
        const sel = createRowSelection({})
        sel.handleRowClick(3)
        expect(sel.isSelected(3)).toBe(true)
    })

    it('returns false for unselected index', () => {
        const sel = createRowSelection({})
        expect(sel.isSelected(3)).toBe(false)
    })
})

describe('onSelectionChange callback', () => {

    it('fires on handleRowClick with current indices', () => {
        const cb = vi.fn()
        const sel = createRowSelection({ onSelectionChange: cb })
        sel.handleRowClick(2)
        expect(cb).toHaveBeenCalledWith([2])
        sel.handleRowClick(0)
        expect(cb).toHaveBeenCalledWith([0, 2])
    })

    it('fires on clearSelection', () => {
        const cb = vi.fn()
        const sel = createRowSelection({ onSelectionChange: cb })
        sel.handleRowClick(1)
        sel.clearSelection()
        expect(cb).toHaveBeenLastCalledWith([])
    })
})

describe('destroy', () => {

    it('clears selections without firing callback', () => {
        const cb = vi.fn()
        const sel = createRowSelection({ onSelectionChange: cb })
        sel.handleRowClick(1)
        cb.mockClear()
        sel.destroy()
        expect(sel.getSelectedIndices()).toEqual([])
        expect(cb).not.toHaveBeenCalled()
    })
})
