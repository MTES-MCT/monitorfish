import {
  FormikCheckbox,
  FormikDateRangePicker,
  FormikEffect,
  FormikMultiCheckbox,
  FormikMultiRadio,
  FormikTextarea,
  FormikTextInput,
  noop
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { MISSION_TYPES_AS_OPTIONS } from './constants'
import { FormikMultiControlUnitPicker } from './FormikMultiControlUnitPicker'
import { FormikMultiZonePicker } from './FormikMultiZonePicker'
import { BOOLEAN_AS_OPTIONS } from '../../../../constants'
import { useNewWindow } from '../../../../ui/NewWindow'
import { FormBody, FormBodyInnerWrapper } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionFormValues } from '../types'
import type { Promisable } from 'type-fest'

export type MainFormProps = {
  initialValues: MissionFormValues
  onChange: (nextValues: MissionFormValues) => Promisable<void>
}
export function MainForm({ initialValues, onChange }: MainFormProps) {
  const currentValuesRef = useRef<MissionFormValues>(initialValues)
  const { newWindowContainerRef } = useNewWindow()

  const controlledInitialValues = useMemo(() => initialValues, [initialValues])

  const updateCurrentValues = useCallback(
    (nextValues: MissionFormValues) => {
      currentValuesRef.current = nextValues

      onChange(currentValuesRef.current)
    },
    [onChange]
  )

  return (
    <Formik initialValues={controlledInitialValues} onSubmit={noop}>
      <Wrapper>
        <FormikEffect onChange={updateCurrentValues as any} />

        <FormHead>
          <h2>Informations générales</h2>
        </FormHead>

        <FormBody>
          <CustomFormBodyInnerWrapper>
            <FormikDateRangePicker
              baseContainer={newWindowContainerRef.current}
              isCompact
              isStringDate
              label="Début et fin de mission"
              // `startDateTimeUtc` & `endDateTimeUtc` in API
              name="dateTimeRangeUtc"
              withTime
            />
            <MultiCheckColumns>
              <FormikMultiCheckbox
                isInline
                label="Types de mission"
                name="missionTypes"
                options={MISSION_TYPES_AS_OPTIONS}
              />

              {/* TODO Fix that in Monitor UI: */}
              {/* Re-enabling a checkbox that has been disabled should set the related FormValues prop
                  to a boolean matching the checkbox `checked` state. */}
              <IsUnderJdpFormikCheckbox isUndefinedWhenDisabled label="Mission sous JDP" name="isUnderJdp" />
            </MultiCheckColumns>

            <FormikMultiRadio
              isInline
              label="Ordre de mission"
              name="hasOrder"
              // TODO Allow more Monitor UI `Option` types.
              options={BOOLEAN_AS_OPTIONS}
            />
          </CustomFormBodyInnerWrapper>

          <FormikMultiControlUnitPicker name="controlUnits" />

          <CustomFormBodyInnerWrapper>
            <FormikMultiZonePicker name="geom" />

            <RelatedFieldGroupWrapper>
              <FormikTextarea label="CACEM : orientations, observations" name="observationsCacem" />
              <FormikTextarea label="CNSP : orientations, observations" name="observationsCnsp" />
            </RelatedFieldGroupWrapper>

            <InlineFieldGroupWrapper>
              <FormikTextInput label="Ouvert par" name="openBy" />
              <FormikTextInput label="Clôturé par" name="closedBy" />
            </InlineFieldGroupWrapper>
          </CustomFormBodyInnerWrapper>
        </FormBody>
      </Wrapper>
    </Formik>
  )
}

const IsUnderJdpFormikCheckbox = styled(FormikCheckbox)`
  margin-left: 48px;
  margin-top: 20px;
`

const MultiCheckColumns = styled.div`
  display: flex;
`

// TODO Why is there a `font-weight: 700` for legends in mini.css?
const Wrapper = styled.div`
  background-color: ${p => p.theme.color.white};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: 33.34%;
  min-width: 33.34%;
  overflow-y: auto;

  /* TODO Handle that in @mtes-mct/monitor-ui. */
  legend {
    font-weight: 400;
  }
`

const CustomFormBodyInnerWrapper = styled(FormBodyInnerWrapper)`
  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 32px;
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
