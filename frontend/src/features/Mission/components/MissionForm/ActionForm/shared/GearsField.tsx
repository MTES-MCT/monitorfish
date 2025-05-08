import { useGetGearsQuery } from '@api/gear'
import { BOOLEAN_AS_OPTIONS } from '@constants/index'
import { HIDDEN_ERROR } from '@features/Mission/components/MissionForm/constants'
import {
  FieldError,
  FormikCheckbox,
  FormikMultiRadio,
  FormikNumberInput,
  FormikTextarea,
  Select,
  SingleTag,
  usePrevious
} from '@mtes-mct/monitor-ui'
import { useField, useFormikContext } from 'formik'
import { isEqual } from 'lodash-es'
import { remove as ramdaRemove } from 'ramda'
import { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { useGetMissionActionFormikUsecases } from '../../hooks/useGetMissionActionFormikUsecases'
import { FieldGroup } from '../../shared/FieldGroup'
import { FieldsetGroup, FieldsetGroupSpinner } from '../../shared/FieldsetGroup'
import { FieldsetGroupSeparator } from '../../shared/FieldsetGroupSeparator'

import type { MissionActionFormValues } from '../../types'
import type { MissionAction } from '@features/Mission/missionAction.types'
import type { Option } from '@mtes-mct/monitor-ui'
import type { Gear } from 'domain/types/Gear'
import type { PartialDeep } from 'type-fest'

export function GearsField() {
  const { values } = useFormikContext<MissionActionFormValues>()
  const [input, meta, helper] = useField<MissionActionFormValues['gearOnboard']>('gearOnboard')
  const previousValue = usePrevious(input.value)
  const { updateSegments } = useGetMissionActionFormikUsecases()

  const getGearsApiQuery = useGetGearsQuery()

  /**
   * This is only used to re-compute fleet segments when a gear is modified
   *  (`input.value.length === previousValue.length`).
   * This should NOT re-compute when:
   * - A gear is added
   * - A gear is removed
   * As these actions are handled below by functions `add()` and `remove()`.
   * */
  useEffect(() => {
    if (
      !!input.value &&
      !!previousValue &&
      input.value.length === previousValue.length &&
      !isEqual(input.value, previousValue)
    ) {
      updateSegments({
        ...values,
        gearOnboard: input.value
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.value, previousValue])

  const gearsAsOptions: Array<Option<Gear>> = useMemo(() => {
    if (!getGearsApiQuery.data) {
      return []
    }

    return getGearsApiQuery.data
      .map(gear => ({
        label: `${gear.code} - ${gear.name}`,
        value: gear
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [getGearsApiQuery.data])

  const typedError = meta.error as unknown as PartialDeep<MissionAction.GearControl>[] | undefined

  const add = (newGear: Gear | undefined) => {
    if (!newGear) {
      return
    }

    const nextGears: MissionAction.GearControl[] = [
      ...(input.value ?? []),
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

    updateSegments({
      ...values,
      gearOnboard: nextGears
    })
    helper.setValue(nextGears)
  }

  const remove = (index: number) => {
    if (!input.value) {
      return
    }

    const nextGearOnboard = ramdaRemove(index, 1, input.value)
    const normalizedNextGearOnboard = nextGearOnboard.length > 0 ? nextGearOnboard : []

    updateSegments({
      ...values,
      gearOnboard: normalizedNextGearOnboard
    })
    helper.setValue(normalizedNextGearOnboard)
  }

  if (!gearsAsOptions.length) {
    return <FieldsetGroupSpinner isLight legend="Engins à bord" />
  }

  return (
    <FieldsetGroup isLight legend="Engins à bord">
      {input.value && input.value.length > 0 && (
        <>
          {input.value.map((gearOnboard, index) => (
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
                  isErrorMessageHidden
                  isInline
                  isRequired
                  label="Engin contrôlé"
                  name={`gearOnboard[${index}].gearWasControlled`}
                  options={BOOLEAN_AS_OPTIONS}
                />

                <StyledFieldGroup isInline>
                  <FormikNumberInput
                    isErrorMessageHidden
                    isRequired
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
          <FieldsetGroupSeparator marginBottom={12} />
        </>
      )}
      <Select
        key={String(input.value?.length)}
        error={typeof meta.error === 'string' ? meta.error : undefined}
        isErrorMessageHidden
        isRequired={!input.value?.length}
        label="Ajouter un engin"
        name="newGear"
        onChange={add}
        options={gearsAsOptions}
        optionValueKey="code"
        searchable
      />

      {typeof meta.error === 'string' && meta.error !== HIDDEN_ERROR && (
        <StyledFieldError>{meta.error}</StyledFieldError>
      )}
    </FieldsetGroup>
  )
}

const Row = styled.div<{
  $isFirst?: boolean | undefined
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
