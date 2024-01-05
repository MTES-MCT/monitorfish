import { Accent, ControlUnit, FormikTextInput, Icon, IconButton, Select } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import {
  CONTROL_UNIT_CONTACT_PREDEFINED_NAMES,
  SORTED_CONTROL_UNIT_CONTACT_PREDEFINED_NAMES_AS_OPTIONS
} from './constants'

export function FormikNameSelect() {
  const [field, meta, helpers] = useField<string | undefined>('name')

  const [isCustomName, setIsCustomName] = useState<boolean>(
    !!field.value && !ControlUnit.ControlUnitContactPredefinedName[field.value]
  )

  const cancelCustomName = useCallback(
    () => {
      setIsCustomName(false)
      helpers.setValue(undefined)
    },

    // We don't want to trigger infinite re-rendering since `helpers.setValue` changes after each rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const handleChange = useCallback(
    (nextName: string | undefined) => {
      if (nextName === 'SWITCH_TO_CUSTOM_NAME') {
        setIsCustomName(true)
        helpers.setValue(undefined)

        return
      }

      helpers.setValue(nextName)
    },

    // We don't want to trigger infinite re-rendering since `helpers.setValue` changes after each rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    if (!isCustomName && field.value && CONTROL_UNIT_CONTACT_PREDEFINED_NAMES.includes(field.value)) {
      setIsCustomName(false)
    }
  }, [field.value, isCustomName])

  return isCustomName ? (
    <Wrapper>
      <FormikTextInput autoFocus isLight label="Nom du contact" name="name" />
      <IconButton accent={Accent.TERTIARY} Icon={Icon.Close} iconSize={17} onClick={cancelCustomName} title="Annuler" />
    </Wrapper>
  ) : (
    <Select
      error={meta.error}
      isLight
      label="Nom du contact"
      name="name"
      onChange={handleChange}
      options={SORTED_CONTROL_UNIT_CONTACT_PREDEFINED_NAMES_AS_OPTIONS}
      searchable
      value={field.value}
    />
  )
}

const Wrapper = styled.div`
  align-items: flex-start;
  display: flex;
  margin-bottom: 16px;

  > .Element-Field {
    flex-grow: 1;
  }
  > .Element-IconButton {
    margin: 22px 0 0 8px;
  }
`
