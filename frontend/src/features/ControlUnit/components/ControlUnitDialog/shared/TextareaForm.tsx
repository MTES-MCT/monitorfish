import { Accent, Button, ControlUnit, Label, Textarea, type TextareaProps } from '@mtes-mct/monitor-ui'
import { useCallback, useState, type FormEvent, type ChangeEvent } from 'react'
import styled from 'styled-components'

import type { Promisable } from 'type-fest'

type TextareaFormProps = Omit<TextareaProps, 'name' | 'onSubmit'> & {
  controlUnit: ControlUnit.ControlUnit
  name: 'areaNote' | 'termsNote'
  onSubmit: (nextControlUnit: ControlUnit.ControlUnit) => Promisable<void>
}
export function TextareaForm({ controlUnit, isLabelHidden, label, name, onSubmit, ...props }: TextareaFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState<string | undefined>(controlUnit[name])

  const cancel = () => {
    setIsEditing(false)
    setValue(controlUnit[name])
  }

  const edit = () => {
    setIsEditing(true)
  }

  const moveCursorToEnd = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    event.target.setSelectionRange(event.target.value.length, event.target.value.length)
  }, [])

  const updateControlUnit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextControlUnit = {
      ...controlUnit,
      [name]: value
    }

    onSubmit(nextControlUnit)

    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Form onSubmit={updateControlUnit}>
        <Textarea
          autoFocus
          data-cy={`ControlUnitDialog-${name}`}
          isLabelHidden={isLabelHidden}
          label={label}
          name={name}
          onChange={setValue}
          onFocus={moveCursorToEnd}
          value={value}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        />
        <div>
          <Button accent={Accent.SECONDARY} onClick={cancel}>
            Annuler
          </Button>
          <Button type="submit">Valider</Button>
        </div>
      </Form>
    )
  }

  return (
    <>
      {!isLabelHidden && <Label>{label}</Label>}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <TextBox data-cy={`ControlUnitDialog-${name}`} onClick={edit}>
        {controlUnit[name]}
      </TextBox>
    </>
  )
}

const Form = styled.form`
  > div:not(:first-child) {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;

    > .Element-Button:last-child {
      margin-left: 8px;
    }
  }
`

const TextBox = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  cursor: text;
  height: 72px;
  padding: 8px 12px;
`
