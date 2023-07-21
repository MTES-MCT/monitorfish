import {
  FieldError,
  FormikCheckbox,
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
import { useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { FormikMultiInfractionPicker } from './FormikMultiInfractionPicker'
import { useGetFormikUsecases } from './hooks/useGetFormikUsecases'
import { useGetGearsQuery } from '../../../../../api/gear'
import { useGetRiskFactorQuery } from '../../../../../api/vessel'
import { BOOLEAN_AS_OPTIONS } from '../../../../../constants'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { FieldGroup } from '../../shared/FieldGroup'
import { FieldsetGroupSpinner } from '../../shared/FieldsetGroup'

import type { Gear } from '../../../../../domain/types/Gear'
import type { MissionAction } from '../../../../../domain/types/missionAction'
import type { DeepPartial } from '../../../../../types'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export function GearsField() {
  const gearsByCode = useMainAppSelector(state => state.gear.gearsByCode)
  const [input, meta, helper] = useField<MissionActionFormValues['gearOnboard']>('gearOnboard')
  const { updateSegments } = useGetFormikUsecases()

  // Other field controlling this field
  const [{ value: internalReferenceNumber }] =
    useField<MissionActionFormValues['internalReferenceNumber']>('internalReferenceNumber')
  const riskFactorApiQuery = useGetRiskFactorQuery(internalReferenceNumber || skipToken)

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

  const typedError = meta.error as unknown as DeepPartial<MissionAction.GearControl>[] | undefined

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
          gearWasControlled: undefined,
          hasUncontrolledMesh: false
        }
      ]

      helper.setValue(nextGears)
      updateSegments()
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
      updateSegments()
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
          gearWasControlled: undefined,
          hasUncontrolledMesh: false
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
    <FormikMultiInfractionPicker
      addButtonLabel="Ajouter une infraction engins"
      label="Engins à bord"
      name="gearInfractions"
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
                  isErrorMessageHidden
                  isUndefinedWhenDisabled
                  label="Maillage déclaré"
                  name={`gearOnboard[${index}].declaredMesh`}
                />
                <FormikNumberInput
                  disabled={!gearOnboard.gearWasControlled || gearOnboard.hasUncontrolledMesh}
                  isErrorMessageHidden
                  isUndefinedWhenDisabled
                  label="Maillage mesuré"
                  name={`gearOnboard[${index}].controlledMesh`}
                />

                <FormikCheckbox
                  disabled={!gearOnboard.gearWasControlled}
                  isUndefinedWhenDisabled
                  label="Maillage non mesuré"
                  name={`gearOnboard[${index}].hasUncontrolledMesh`}
                />
              </StyledFieldGroup>
              {typedError && typedError[index]?.declaredMesh && (
                <FieldError>{typedError[index]?.declaredMesh}</FieldError>
              )}
              {typedError && typedError[index]?.controlledMesh && (
                <FieldError>{typedError[index]?.controlledMesh}</FieldError>
              )}

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

      {typeof meta.error === 'string' && <StyledFieldError>{meta.error}</StyledFieldError>}
    </FormikMultiInfractionPicker>
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

const StyledFieldError = styled(FieldError)`
  /*
    For some unknown reason, there is a shadow "spacing" between the <Select /> and this <p />.
    The expected margin-top is 4px.
  */
  margin: 0;
`
