import { type FocusEvent, type MouseEvent, useEffect, useRef, useState } from 'react'

const HOVER_INTENT_DELAY_MS = 40

export type RowActivation = ReturnType<typeof useRowActivation>

// Rsuite pickers portal their dropdown outside the toggle's DOM subtree, under classes like
// `rs-picker-popup` / `rs-picker-check-menu` — never the exact `rs-picker` class — so an exact match misses
// clicks inside the dropdown (search input, option checkboxes).
const isRowPinningTextInput = (target: Element | null): target is HTMLInputElement =>
  target instanceof HTMLInputElement && target.type === 'text' && !target.closest('[class*="rs-picker"]')

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
  // Id of a field a `WeightInput` should self-focus once mounted — keyboard row navigation can't focus the
  // target synchronously since it isn't in the DOM yet.
  const [focusRequestId, setFocusRequestId] = useState<string | undefined>(undefined)

  // Debounce hover so a cursor merely sweeping across rows doesn't mount each row's (heavy) editors.
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(hoverTimerRef.current), [])

  const isRowActive = (index: number) => index === hoveredIndex || index === focusedIndex || index === openPickerIndex

  // Only hold the row open for its text inputs (CheckPickers are covered by `openPickerIndex` while their
  // dropdown is open). This keeps a focused text input visible even after the cursor has left the row.
  const handleRowFocus = (index: number, event: FocusEvent<HTMLElement>) => {
    if (isRowPinningTextInput(event.target)) {
      setFocusedIndex(index)
    }
  }

  // Release the row once focus leaves it entirely (moving between its own inputs keeps it active).
  const handleRowBlur = (index: number, event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocusedIndex(prev => (prev === index ? undefined : prev))
    }
  }

  const handleRowMouseEnter = (index: number, event: MouseEvent<HTMLElement>) => {
    clearTimeout(hoverTimerRef.current)
    // Read now, synchronously: `event.currentTarget` is null by the time a setState updater (below) runs,
    // since that happens later during React's render phase, after the synchronous dispatch has returned.
    const activeElement = event.currentTarget.ownerDocument.activeElement
    // Hovering a new row drops any hover/picker activation still pinned to a different row. This self-heals
    // a `mouseleave` that never fired, or a CheckPicker `onClose` lost to an async re-render — either would
    // otherwise keep the previous row expanded, mounting two editors for the same field.
    setHoveredIndex(prev => (prev === undefined || prev === index ? prev : undefined))
    setFocusedIndex(prev => {
      if (prev === undefined || prev === index) {
        return prev
      }

      // Stays open if the user is genuinely still typing there (real DOM focus), even though the cursor
      // moved — otherwise self-heals like above, so it doesn't stay stuck "active" once focus has actually
      // moved on (e.g. into a picker elsewhere in the row).
      return isRowPinningTextInput(activeElement) ? prev : undefined
    })
    setOpenPickerIndex(prev => (prev === undefined || prev === index ? prev : undefined))
    hoverTimerRef.current = setTimeout(() => setHoveredIndex(index), HOVER_INTENT_DELAY_MS)
  }
  const handleRowMouseLeave = (index: number) => {
    clearTimeout(hoverTimerRef.current)
    setHoveredIndex(prev => (prev === index ? undefined : prev))
  }

  // A real click shouldn't wait out the hover-intent delay: activate the row synchronously on mousedown so
  // its editor is already mounted by the time the click reaches it, instead of requiring a second click.
  const activateRowNow = (index: number) => {
    clearTimeout(hoverTimerRef.current)
    setHoveredIndex(index)
    setFocusedIndex(prev => (prev === undefined || prev === index ? prev : undefined))
    setOpenPickerIndex(prev => (prev === undefined || prev === index ? prev : undefined))
  }

  // Marks `index` as holding keyboard focus without waiting for the real DOM `focus` event — used when
  // navigating rows with the arrow keys, where the target row's input isn't mounted (or focused) yet.
  const activateRowForNavigation = (index: number) => {
    clearTimeout(hoverTimerRef.current)
    setFocusedIndex(index)
  }

  const requestFocus = (id: string) => setFocusRequestId(id)
  const clearFocusRequest = () => setFocusRequestId(undefined)

  const handlePickerOpen = (index: number) => setOpenPickerIndex(index)
  const handlePickerClose = (index: number) => setOpenPickerIndex(prev => (prev === index ? undefined : prev))

  const deactivate = () => {
    clearTimeout(hoverTimerRef.current)
    setHoveredIndex(undefined)
    setFocusedIndex(undefined)
    setOpenPickerIndex(undefined)
  }

  return {
    activateRowForNavigation,
    activateRowNow,
    clearFocusRequest,
    deactivate,
    focusRequestId,
    handlePickerClose,
    handlePickerOpen,
    handleRowBlur,
    handleRowFocus,
    handleRowMouseEnter,
    handleRowMouseLeave,
    hoveredIndex,
    isRowActive,
    requestFocus
  }
}
