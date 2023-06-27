import {
  Checkbox,
  FieldError,
  FormikMultiRadio,
  FormikNumberInput,
  FormikTextarea,
  Select,
  SingleTag,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useField } from 'formik'
import { remove as ramdaRemove } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { FormikMultiInfractionPicker } from './FormikMultiInfractionPicker'
import { useGetGearsQuery } from '../../../../../api/gear'
import { useGetRiskFactorQuery } from '../../../../../api/vessel'
import { BOOLEAN_AS_OPTIONS } from '../../../../../constants'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { FieldGroup } from '../../shared/FieldGroup'
import { FieldsetGroupSpinner } from '../../shared/FieldsetGroup'

import type { Gear } from '../../../../../domain/types/Gear'
import type { MissionAction } from '../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

const TypedFormikMultiInfractionPicker = FormikMultiInfractionPicker<MissionAction.GearInfraction>

export function GearsField() {
  const gearsByCode = useMainAppSelector(state => state.gear.gearsByCode)
  const [input, meta, helper] = useField<MissionActionFormValues['gearOnboard']>('gearOnboard')

  // Other field controlling this field
  const [{ value: internalReferenceNumber }] =
    useField<MissionActionFormValues['internalReferenceNumber']>('internalReferenceNumber')
  const riskFactorApiQuery = useGetRiskFactorQuery(internalReferenceNumber || skipToken)

  const { newWindowContainerRef } = useNewWindow()

  /**
   * This state save the "Maillage non mesuré" (UNSAVED_FIELD_meshWasNotControlled) field checkbox, as it it not saved in the database.
   * The purpose of this checkbox is to disable and init the `controlledMesh` input.
   */
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

  const handleMeshWasNotControlledChange = (
    gearCode: MissionAction.GearControl['gearCode'],
    isChecked: boolean | undefined
  ) => {
    const nextUncontrolledMeshGearCodes = isChecked
      ? [...uncontrolledMeshGearCodes, gearCode]
      : uncontrolledMeshGearCodes.filter(uncontrolledGearCode => uncontrolledGearCode !== gearCode)

    setUncontrolledMeshGearCodes(nextUncontrolledMeshGearCodes)
  }

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

  useEffect(
    () => {
      if (input.value?.length) {
        return
      }

      if (!gearsByCode || !riskFactorApiQuery.data) {
        return
      }

      const { gearOnboard } = riskFactorApiQuery.data
      if (!gearOnboard?.length) {
        return
      }

      const nextGears = gearOnboard
        .map(gear => ({ ...gearsByCode[gear.gear], declaredMesh: gear.mesh }))
        .map(gear => ({
          comments: undefined,
          controlledMesh: undefined,
          declaredMesh: gear.declaredMesh,
          gearCode: gear.code,
          gearName: gear.name,
          gearWasControlled: undefined
        }))

      helper.setValue(nextGears)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [riskFactorApiQuery.data, gearsByCode]
  )

  if (!gearsAsOptions.length) {
    return <FieldsetGroupSpinner isLight legend="Engins à bord" />
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
          <Row
            // eslint-disable-next-line react/no-array-index-key
            key={`gearOnboard-${gearOnboard.gearCode}-${index}`}
            $isFirst={index === 0}
            style={{ marginTop: index > 0 ? '24px' : 0 }}
          >
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

              <StyledFieldGroup isInline>
                <FormikNumberInput
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
                  checked={uncontrolledMeshGearCodes.includes(gearOnboard.gearCode)}
                  disabled={!gearOnboard.gearWasControlled}
                  isUndefinedWhenDisabled
                  label="Maillage non mesuré"
                  name="UNSAVED_FIELD_meshWasNotControlled"
                  onChange={isChecked => handleMeshWasNotControlledChange(gearOnboard.gearCode, isChecked)}
                />
              </StyledFieldGroup>

              <FormikTextarea
                label={`${gearOnboard.gearCode} : autres mesures et dispositifs`}
                name={`gearOnboard[${index}].comments`}
                rows={2}
              />
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
        optionValueKey="code"
        searchable
      />

      {meta.error && <FieldError>{meta.error}</FieldError>}
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
    margin-top: 16px;
  }
`

const StyledFieldGroup = styled(FieldGroup)`
  justify-content: flex-start;
  margin-top: 8px !important;

  > .Field-NumberInput {
    margin-right: 16px;
  }
`
