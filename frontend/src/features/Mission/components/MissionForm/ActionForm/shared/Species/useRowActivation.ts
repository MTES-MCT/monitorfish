import { type FocusEvent, type MouseEvent, useEffect, useRef, useState } from 'react'

const HOVER_INTENT_DELAY_MS = 40

export type RowActivation = ReturnType<typeof useRowActivation>

// Rsuite pickers render their dropdown (search input + options) in a portal that sits outside the toggle's
// own DOM subtree, under classes like `rs-picker-popup` / `rs-picker-check-menu` — never the exact
// `rs-picker` class. A plain `.closest('.rs-picker')` check misses all of it, so anything clicked inside a
// picker's dropdown (its search input, an option checkbox) would otherwise count as "real" row focus.
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
  // The id (DOM `name`/`id`) of a field that a `WeightInput` should self-focus once it mounts/updates as
  // active. Keyboard row-to-row navigation can't focus the target input synchronously — it isn't in the DOM
  // yet until the row's activation state re-renders — so it leaves this request for the input to pick up
  // in its own effect once it exists.
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
    // React nulls out `event.currentTarget` once the synchronous dispatch of this handler returns, but a
    // `setState` updater function (below) only runs later, during React's render phase — reading
    // `event.currentTarget` from inside one throws (`currentTarget` is `null` by then) and crashes the whole
    // table. Read it now, synchronously, and close over the plain value instead.
    const activeElement = event.currentTarget.ownerDocument.activeElement
    // Hovering a new row drops any hover/picker activation still pinned to a different row. This self-heals
    // two cases: a `mouseleave` that never fired (so a previous row stayed hovered), and a CheckPicker's
    // `onClose` that was lost because an async re-render (e.g. a fleet-segment recompute) remounted the
    // picker. Either would otherwise keep the previous row expanded and mount two editors for the same field.
    setHoveredIndex(prev => (prev === undefined || prev === index ? prev : undefined))
    setFocusedIndex(prev => {
      if (prev === undefined || prev === index) {
        return prev
      }

      // A row a user is genuinely still typing in stays open even though the cursor has moved elsewhere —
      // but only for as long as that's actually true. Verify against real DOM focus (captured above, so
      // this also works when the mission form is portaled into the side-window popup) rather than trusting
      // the flag blindly: once focus has actually moved on (e.g. the user finished typing and clicked a
      // picker elsewhere in the row), keep the old self-heal so this row doesn't stay stuck "active" —
      // mounting two rows' worth of same-labelled fields (e.g. two "Zone de pêche" pickers).
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
