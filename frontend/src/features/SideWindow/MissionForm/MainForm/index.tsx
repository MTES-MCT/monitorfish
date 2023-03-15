import {
  FormikCheckbox,
  FormikDateRangePicker,
  FormikEffect,
  FormikMultiCheckbox,
  FormikMultiRadio,
  FormikTextarea,
  FormikTextInput,
  noop,
  useForceUpdate
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { equals } from 'ramda'
import { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { MISSION_NATURES_AS_OPTIONS, MISSION_TYPES_AS_OPTIONS } from './constants'
import { FormikMultiControlUnitPicker } from './FormikMultiControlUnitPicker'
import { FormikMultiZonePicker } from './FormikMultiZonePicker'
import { BOOLEAN_AS_OPTIONS } from '../../../../constants'
import { Mission } from '../../../../domain/types/mission'
import { useNewWindow } from '../../../../ui/NewWindow'
import { FormBody } from '../FormBody'
import { FormHead } from '../FormHead'

import type { MissionFormValues } from '../types'
import type { Promisable } from 'type-fest'

export type MainFormProps = {
  initialValues: MissionFormValues
  onChange: (nextValues: MissionFormValues) => Promisable<void>
}
export function MainForm({ initialValues, onChange }: MainFormProps) {
  const currentValuesRef = useRef<MissionFormValues>(initialValues)
  const { newWindowContainerRef } = useNewWindow()

  const { forceUpdate } = useForceUpdate()

  const controlledInitialValues = useMemo(() => initialValues, [initialValues])

  const updateCurrentValues = useCallback(
    (nextValues: MissionFormValues) => {
      const previousValues = { ...currentValuesRef.current }
      currentValuesRef.current = nextValues

      if (!equals(nextValues.missionNature, previousValues.missionNature)) {
        forceUpdate()
      }

      onChange(currentValuesRef.current)
    },
    [forceUpdate, onChange]
  )

  const hasMissionOrderField = Boolean(currentValuesRef.current.missionNature?.includes(Mission.MissionNature.FISH))
  const isMissionUnderJdpCheckboxEnabled = Boolean(
    currentValuesRef.current.missionNature?.includes(Mission.MissionNature.FISH)
  )

  return (
    <Formik initialValues={controlledInitialValues} onSubmit={noop}>
      <Wrapper>
        <FormikEffect onChange={updateCurrentValues as any} />

        <FormHead>
          <h2>Informations générales</h2>
        </FormHead>

        <CustomFormBody>
          <FormikDateRangePicker
            baseContainer={newWindowContainerRef.current}
            isCompact
            isStringDate
            label="Début et fin de mission"
            // `startDateTimeUtc` & `endDateTimeUtc` in API
            name="dateTimeRangeUtc"
            withTime
          />
          <FormikMultiRadio isInline label="Type de mission" name="missionType" options={MISSION_TYPES_AS_OPTIONS} />
          <MissionNatureWrapper>
            <FormikMultiCheckbox
              isInline
              label="Intentions principales de mission"
              name="missionNature"
              options={MISSION_NATURES_AS_OPTIONS}
            />

            {/* TODO What to do with this prop? */}
            {/* TODO Fix that in Monitor UI: */}
            {/* Re-enabling a checkbox that has been disabled should set the related FormValues prop
                to a boolean matching the checkbox `checked` state. */}
            <FormikCheckbox disabled={!isMissionUnderJdpCheckboxEnabled} label="Mission sous JDP" name="isUnderJdp" />
          </MissionNatureWrapper>

          <FormikMultiControlUnitPicker name="controlUnits" />

          <FormikMultiZonePicker name="geom" />

          {/* TODO What to do with this prop? */}
          {hasMissionOrderField && (
            <FormikMultiRadio
              isInline
              label="Ordre de mission"
              name="hasOrder"
              // TODO Allow more Monitor UI `Option` types.
              options={BOOLEAN_AS_OPTIONS}
            />
          )}

          <RelatedFieldGroupWrapper>
            <FormikTextarea label="CACEM : orientations, observations" name="observationsCacem" />
            <FormikTextarea label="CNSP : orientations, observations" name="observationsCnsp" />
          </RelatedFieldGroupWrapper>

          <InlineFieldGroupWrapper>
            <FormikTextInput label="Ouvert par" name="openBy" />
            <FormikTextInput label="Clôturé par" name="closedBy" />
          </InlineFieldGroupWrapper>
        </CustomFormBody>
      </Wrapper>
    </Formik>
  )
}

// TODO Why is there a `font-weight: 700` for legends in mini.css?
const Wrapper = styled.div`
  background-color: ${p => p.theme.color.white};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: 33.34%;
  min-width: 33.34%;

  /* TODO Handle that in @mtes-mct/monitor-ui. */
  legend {
    font-weight: 400;
  }
`

const CustomFormBody = styled(FormBody)`
  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 32px;
  }

  > button {
    margin-top: 16px;
  }
`

const RelatedFieldGroupWrapper = styled.div`
  > div:not(:first-child) {
    margin-top: 8px;
  }
`

const InlineFieldGroupWrapper = styled.div`
  display: flex;

  > div:first-child {
    margin-right: 8px;
    width: 50%;
  }

  > div:last-child {
    margin-left: 8px;
    width: 50%;
  }
`

const MissionNatureWrapper = styled.div`
  align-items: flex-end;
  display: flex;

  > div {
    margin-left: 10px;
  }
`
