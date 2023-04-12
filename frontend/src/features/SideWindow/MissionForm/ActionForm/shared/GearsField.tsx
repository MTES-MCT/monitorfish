import { Checkbox, FormikMultiRadio, FormikNumberInput, FormikTextarea, Select, SingleTag } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { remove as ramdaRemove } from 'ramda'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { FormikMultiInfractionPicker } from './FormikMultiInfractionPicker'
import { useGetGearsQuery } from '../../../../../api/gear'
import { BOOLEAN_AS_OPTIONS } from '../../../../../constants'
import { useNewWindow } from '../../../../../ui/NewWindow'
import { FieldGroup } from '../../shared/FieldGroup'
import { FieldsetGroupSpinner } from '../../shared/FieldsetGroup'

import type { Gear } from '../../../../../domain/types/Gear'
import type { MissionAction } from '../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

const TypedFormikMultiInfractionPicker = FormikMultiInfractionPicker<MissionAction.GearInfraction>

export function GearsField() {
  const [input, , helper] = useField<MissionActionFormValues['gearOnboard']>('gearOnboard')

  const { newWindowContainerRef } = useNewWindow()

  const [uncontrolledMeshGearCodes, setUncontrolledMeshGearCodes] = useState<string[]>([])

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

  const handleMeshWasNotControlledChange = useCallback(
    (gearCode: MissionAction.GearControl['gearCode'], isChecked: boolean) => {
      const nextUncontrolledMeshGearCodes = isChecked
        ? [...uncontrolledMeshGearCodes, gearCode]
        : uncontrolledMeshGearCodes.filter(uncontrolledGearCode => uncontrolledGearCode !== gearCode)

      setUncontrolledMeshGearCodes(nextUncontrolledMeshGearCodes)
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
    return <FieldsetGroupSpinner isLight legend="Espèces à bord" />
  }

  return (
    <TypedFormikMultiInfractionPicker
      addButtonLabel="Ajouter une infraction engins"
      // TODO Check that prop (it's a radio in the XD which doesn't make sense to me).
      infractionCheckboxProps={{
        label: 'Appréhension engin',
        name: 'gearSeized'
      }}
      label="Engins à bord"
      name="gearInfractions"
      seizurePropName="gearSeized"
      seizureTagLabel="Appréhension engin"
    >
      {input.value &&
        input.value.length > 0 &&
        input.value.map((gearOnboard, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Row key={`gearOnboard-${index}`} $isFirst={index === 0}>
            <RowInnerWrapper>
              <SingleTag
                onDelete={() => remove(index)}
              >{`${gearOnboard.gearCode} - ${gearOnboard.gearName}`}</SingleTag>

              <FormikMultiRadio
                isInline
                label="Engin contrôlé"
                name={`gearOnboard[${index}].gearWasControlled`}
                options={BOOLEAN_AS_OPTIONS}
              />

              <FieldGroup isInline>
                <FormikNumberInput
                  disabled={!gearOnboard.gearWasControlled}
                  isUndefinedWhenDisabled
                  label="Maillage déclaré"
                  name={`gearOnboard[${index}].declaredMesh`}
                />
                <FormikNumberInput
                  disabled={!gearOnboard.gearWasControlled || uncontrolledMeshGearCodes.includes(gearOnboard.gearCode)}
                  isUndefinedWhenDisabled
                  label="Maillage mesuré"
                  name={`gearOnboard[${index}].controlledMesh`}
                />

                <Checkbox
                  disabled={!gearOnboard.gearWasControlled}
                  isUndefinedWhenDisabled
                  label="Maillage non mesuré"
                  name="gearWasNotControlled"
                  onChange={isChecked => handleMeshWasNotControlledChange(gearOnboard.gearCode, isChecked)}
                />
              </FieldGroup>

              <FormikTextarea label="OTM : autres mesures et dispositifs" name={`gearOnboard[${index}].comments`} />
            </RowInnerWrapper>
          </Row>
        ))}

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
    </TypedFormikMultiInfractionPicker>
  )
}

const Row = styled.div<{
  $isFirst?: boolean
}>`
  margin-top: ${p => (p.$isFirst ? 0 : 16)}px;

  > legend {
    margin: 24px 0 8px;
  }

  > hr {
    margin-bottom: 16px;
  }

  input[type='number'] {
    width: 112px;
  }
`

const RowInnerWrapper = styled.div`
  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 24px;
  }
`
