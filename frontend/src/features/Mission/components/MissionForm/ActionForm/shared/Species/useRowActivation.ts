import { type FocusEvent, useEffect, useRef, useState } from 'react'

const HOVER_INTENT_DELAY_MS = 40

export type RowActivation = ReturnType<typeof useRowActivation>

/**
 * Tracks which row of a species table is "active" — i.e. shows its editors instead of read-only text.
 *
 * A row is active while it is hovered, OR while it holds the keyboard focus, OR while one of its pickers is
 * open. Tracking focus and picker-open separately from hover keeps the row in edit mode once the cursor
 * leaves it — while a TextInput is still focused, or while a CheckPicker's portal-rendered menu is in use.
 *
 * Handlers are wired by `SpeciesTableRow` onto each row (no JSX spread, which the repo bans in features).
 */
export function useRowActivation() {
  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined)
  const [focusedIndex, setFocusedIndex] = useState<number | undefined>(undefined)
  const [openPickerIndex, setOpenPickerIndex] = useState<number | undefined>(undefined)

  // Debounce hover so a cursor merely sweeping across rows doesn't mount each row's (heavy) editors.
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(hoverTimerRef.current), [])

  const isRowActive = (index: number) => index === hoveredIndex || index === focusedIndex || index === openPickerIndex

  // Only hold the row open for its text inputs (CheckPickers are covered by `openPickerIndex` while their
  // dropdown is open). This keeps a focused text input visible even after the cursor has left the row.
  const handleRowFocus = (index: number, event: FocusEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' && !target.closest('.rs-picker')) {
      setFocusedIndex(index)
    }
  }

  // Release the row once focus leaves it entirely (moving between its own inputs keeps it active).
  const handleRowBlur = (index: number, event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setFocusedIndex(prev => (prev === index ? undefined : prev))
    }
  }

  const handleRowMouseEnter = (index: number) => {
    clearTimeout(hoverTimerRef.current)
    // Hovering a new row makes it the sole active row: drop any focus/picker activation still pinned to a
    // different row. This self-heals the case where a CheckPicker's `onClose` never fired — an async
    // re-render (e.g. a fleet-segment recompute) remounted the picker, so the close event was lost — which
    // would otherwise keep the previous row expanded and mount two editors for the same field.
    setFocusedIndex(prev => (prev === undefined || prev === index ? prev : undefined))
    setOpenPickerIndex(prev => (prev === undefined || prev === index ? prev : undefined))
    hoverTimerRef.current = setTimeout(() => setHoveredIndex(index), HOVER_INTENT_DELAY_MS)
  }
  const handleRowMouseLeave = (index: number) => {
    clearTimeout(hoverTimerRef.current)
    setHoveredIndex(prev => (prev === index ? undefined : prev))
  }

  const handlePickerOpen = (index: number) => setOpenPickerIndex(index)
  const handlePickerClose = (index: number) => setOpenPickerIndex(prev => (prev === index ? undefined : prev))

  const deactivate = () => {
    clearTimeout(hoverTimerRef.current)
    setHoveredIndex(undefined)
    setFocusedIndex(undefined)
    setOpenPickerIndex(undefined)
  }

  return {
    deactivate,
    handlePickerClose,
    handlePickerOpen,
    handleRowBlur,
    handleRowFocus,
    handleRowMouseEnter,
    handleRowMouseLeave,
    hoveredIndex,
    isRowActive
  }
}
