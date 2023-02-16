import { Checkbox, FormikNumberInput, FormikTextarea, Select, SingleTag } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { remove as ramdaRemove, update } from 'ramda'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { FormikMultiInfractionPicker } from './FormikMultiInfractionPicker'
import { useGetGearsQuery } from '../../../../../api/gear'
import { FrontendError } from '../../../../../libs/FrontendError'
import { useNewWindow } from '../../../../../ui/NewWindow'
import { FieldGroup } from '../../FieldGroup'

import type { Gear } from '../../../../../domain/types/Gear'
import type { MissionAction } from '../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export function GearsField() {
  const [input, , helper] = useField<MissionActionFormValues['gearOnboard']>('gearOnboard')

  const { newWindowContainerRef } = useNewWindow()

  const getGearsApiQuery = useGetGearsQuery()

  const gearsAsOptions: Array<Option<Gear>> = useMemo(() => {
    if (!getGearsApiQuery.data) {
      return []
    }

    return getGearsApiQuery.data.map(gear => ({
      label: `${gear.code} - ${gear.name}`,
      value: gear
    }))
  }, [getGearsApiQuery.data])

  const add = useCallback(
    (newGear: Gear | undefined) => {
      if (!newGear) {
        return
      }

      const nextGears: MissionAction.GearControl[] = [
        ...(input.value || []),
        {
          comments: undefined,
          controlledMesh: undefined,
          declaredMesh: undefined,
          gearCode: newGear.code,
          gearName: newGear.name,
          gearWasControlled: undefined
        }
      ]

      helper.setValue(nextGears)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const handleGearWasNotControlledChange = useCallback(
    (index: number, isChecked: boolean) => {
      if (!input.value) {
        throw new FrontendError(
          '`input.value` is undefined. This should never happen.',
          'handleGearWasNotControlledChange()'
        )
      }

      const gearOnboard = input.value[index]
      if (!gearOnboard) {
        throw new FrontendError(
          '`gearOnboard` is undefined. This should never happen.',
          'handleGearWasNotControlledChange()'
        )
      }

      const updatedGearOnboard = {
        ...gearOnboard,
        gearWasControlled: !isChecked
      }

      const nextGearOnboard = update(index, updatedGearOnboard, input.value)

      helper.setValue(nextGearOnboard)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const remove = useCallback(
    (index: number) => {
      if (!input.value) {
        return
      }

      const nextGearOnboard = ramdaRemove(index, 1, input.value)
      const normalizedNextGearOnboard = nextGearOnboard.length > 0 ? nextGearOnboard : undefined

      helper.setValue(normalizedNextGearOnboard)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  if (!gearsAsOptions.length) {
    return <>Loading...</>
  }

  return (
    <FormikMultiInfractionPicker
      addButtonLabel="Ajouter une infraction engins"
      // TODO Check that prop (it's a radio in the XD which doesn't make sense to me).
      infractionCheckboxProps={{
        label: 'Appréhension engin',
        name: 'gearSeized'
      }}
      label="Engins à bord"
      name="gearInfractions"
    >
      {input.value &&
        input.value.length > 0 &&
        input.value.map((onboardGear, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Row key={`gearOnboard-${index}`}>
            <RowInnerWrapper>
              <SingleTag
                onDelete={() => remove(index)}
              >{`${onboardGear.gearCode} - ${onboardGear.gearName}`}</SingleTag>

              <FieldGroup isInline>
                <FormikNumberInput label="Maillage déclaré" name={`gearOnboard[${index}].declaredMesh`} />
                <FormikNumberInput label="Maillage mesuré" name={`gearOnboard[${index}].controlledMesh`} />
                <Checkbox
                  label="Maillage non mesuré"
                  name="gearWasNotControlled"
                  onChange={isChecked => handleGearWasNotControlledChange(index, isChecked)}
                />
              </FieldGroup>

              <FormikTextarea label="OTM : autres mesures et dispositifs" name={`gearOnboard[${index}].comments`} />
            </RowInnerWrapper>
          </Row>
        ))}

      <FieldGroup>
        <Select
          key={String(input.value?.length)}
          baseContainer={newWindowContainerRef.current}
          label="Ajouter un engin"
          name="newGear"
          onChange={add}
          options={gearsAsOptions}
          searchable
          virtualized
        />
      </FieldGroup>
    </FormikMultiInfractionPicker>
  )
}

const Row = styled.div`
  > legend {
    margin: 24px 0 8px;
  }

  > hr {
    margin-bottom: 16px;
  }
`

const RowInnerWrapper = styled.div`
  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 24px;
  }
`
