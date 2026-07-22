import { TextInput } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

/**
 * A Formik-bound `TextInput` that stores its value as a `number` (the weight fields are typed as numbers in
 * their Zod schemas). `FormikTextInput` always writes a string and cannot be intercepted, so we wire
 * `TextInput` to Formik ourselves and coerce on change. A local `draft` keeps the raw text so decimals
 * (e.g. `471.2`) stay typeable while the committed Formik value remains numeric.
 *
 * We use this TextInput to avoid the arrows display in NumberInput
 */
type WeightInputProps = Readonly<{
  className?: string
  clearFocusRequest?: (() => void) | undefined
  disabled?: boolean
  focusRequestId?: string | undefined
  isLabelHidden?: boolean
  isLight?: boolean
  label: string
  name: string
  onNavigateRow?: ((direction: 'up' | 'down') => void) | undefined
}>
export function WeightInput({
  className,
  clearFocusRequest,
  disabled,
  focusRequestId,
  isLabelHidden,
  isLight,
  label,
  name,
  onNavigateRow
}: WeightInputProps) {
  const [field, , helper] = useField<number | undefined>(name)
  const [draft, setDraft] = useState<string>(field.value == null ? '' : String(field.value))
  const inputRef = useRef<HTMLInputElement>(null)

  // Resync the draft when the committed value changes from the outside (reset, prefill, recompute),
  // but preserve in-progress typing when it already represents the same number (e.g. "471." → 471).
  useEffect(() => {
    const committed = field.value == null ? '' : String(field.value)
    setDraft(prev => (prev.trim() !== '' && Number(prev) === field.value ? prev : committed))
  }, [field.value])

  // Claims a pending row-navigation focus request once mounted, instead of the caller polling for the
  // element. Uses its own `inputRef` rather than `document.getElementById`: the mission form can be
  // portaled into the side window's popup, where `document` would still refer to the main window.
  useEffect(() => {
    if (focusRequestId !== name) {
      return
    }

    inputRef.current?.focus()
    inputRef.current?.select()

    clearFocusRequest?.()
  }, [clearFocusRequest, focusRequestId, name])

  return (
    <TextInput
      // Chrome's per-field autofill dropdown intercepts ArrowUp/ArrowDown before `onKeyDown` below sees
      // them, breaking row navigation (Firefox doesn't do this) — `off` keeps it from appearing.
      autoComplete="off"
      className={className ?? ''}
      disabled={disabled}
      inputRef={inputRef}
      isLabelHidden={isLabelHidden}
      isLight={isLight}
      label={label}
      name={name}
      onChange={nextValue => {
        setDraft(nextValue ?? '')
        const normalized = nextValue?.replace(',', '.').trim()
        const parsed = normalized ? Number(normalized) : undefined
        helper.setValue(parsed === undefined || Number.isNaN(parsed) ? undefined : parsed)
      }}
      onKeyDown={event => {
        if (!onNavigateRow || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) {
          return
        }

        event.preventDefault()
        onNavigateRow(event.key === 'ArrowUp' ? 'up' : 'down')
      }}
      value={draft}
    />
  )
}

export const StyledWeightInput = styled(WeightInput)<{
  $isHovered: boolean
}>`
  > div > input {
    background-color: ${p => (p.$isHovered ? p.theme.color.blueYonder25 : p.theme.color.white)} !important;
  }
`
