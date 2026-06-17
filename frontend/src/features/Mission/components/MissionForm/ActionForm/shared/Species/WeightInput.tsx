import { TextInput } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useEffect, useState } from 'react'
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
  disabled?: boolean
  isLabelHidden?: boolean
  isLight?: boolean
  label: string
  name: string
}>
export function WeightInput({ className, disabled, isLabelHidden, isLight, label, name }: WeightInputProps) {
  const [field, , helper] = useField<number | undefined>(name)
  const [draft, setDraft] = useState<string>(field.value == null ? '' : String(field.value))

  // Resync the draft when the committed value changes from the outside (reset, prefill, recompute),
  // but preserve in-progress typing when it already represents the same number (e.g. "471." → 471).
  useEffect(() => {
    const committed = field.value == null ? '' : String(field.value)
    setDraft(prev => (prev.trim() !== '' && Number(prev) === field.value ? prev : committed))
  }, [field.value])

  return (
    <TextInput
      className={className ?? ''}
      disabled={disabled}
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
