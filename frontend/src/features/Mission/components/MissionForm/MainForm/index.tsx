import { BOOLEAN_AS_OPTIONS } from '@constants/index'
import { FormHead } from '@features/Mission/components/MissionForm/shared/FormHead'
import { MISSION_EVENT_UNSYNCHRONIZED_PROPERTIES_IN_FORM } from '@features/Mission/components/MissionForm/sse'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import {
  FormikCheckbox,
  FormikEffect,
  FormikMultiCheckbox,
  FormikMultiRadio,
  FormikTextarea,
  FormikTextInput
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { isEqual, omit, isEmpty, noop } from 'lodash-es'
import { memo, useEffect, useRef } from 'react'
import styled from 'styled-components'

import { MISSION_TYPES_AS_OPTIONS } from './constants'
import { FormikDoubleDatePicker } from './FormikDoubleDatePicker'
import { FormikLocationPicker } from './FormikLocationPicker'
import { FormikMultiControlUnitPicker } from './FormikMultiControlUnitPicker'
import { FormikSyncMissionFields } from './FormikSyncMissionFields'
import { MainFormLiveSchema } from './schemas'
import { useListenToMissionEventUpdatesById } from '../hooks/useListenToMissionEventUpdatesById'
import { FormBody, FormBodyInnerWrapper } from '../shared/FormBody'

import type { MissionMainFormValues } from '../types'
import type { Promisable } from 'type-fest'

type MainFormProps = Readonly<{
  initialValues: MissionMainFormValues
  missionId: number | undefined
  onChange: (nextValues: MissionMainFormValues) => Promisable<void>
}>
function UnmemoizedMainForm({ initialValues, missionId, onChange }: MainFormProps) {
  const missionEvent = useListenToMissionEventUpdatesById(missionId)
  const isMissionEventOutdated = useRef(false)
  const isFormOpening = useRef(true)
  const engagedControlUnit = useMainAppSelector(state => state.missionForm.engagedControlUnit)

  useEffect(() => {
    isMissionEventOutdated.current = false
  }, [missionEvent])

  function validateBeforeOnChange(validateForm) {
    return async nextValues => {
      const errors = await validateForm()
      const isValid = isEmpty(errors)

      if (engagedControlUnit) {
        return
      }

      // Prevent triggering `onChange` when opening the form
      if (isFormOpening.current && isEqual(initialValues, nextValues)) {
        isFormOpening.current = false

        return
      }

      // Prevent re-sending the form when receiving an update
      const nextValuesWithoutIsValid = omit(nextValues, MISSION_EVENT_UNSYNCHRONIZED_PROPERTIES_IN_FORM)
      const missionEventWithoutIsValid = omit(missionEvent, MISSION_EVENT_UNSYNCHRONIZED_PROPERTIES_IN_FORM)
      if (!isMissionEventOutdated.current && isEqual(missionEventWithoutIsValid, nextValuesWithoutIsValid)) {
        return
      }

      onChange({ ...nextValues, isValid })
      isMissionEventOutdated.current = true
    }
  }

  return (
    <Formik initialValues={initialValues} onSubmit={noop} validationSchema={MainFormLiveSchema}>
      {({ validateForm }) => (
        <Wrapper>
          <FormikEffect onChange={validateBeforeOnChange(validateForm)} />
          <FormikSyncMissionFields missionId={missionId} />

          <FormHead>
            <h2>Informations générales</h2>
          </FormHead>

          <FormBody>
            <CustomFormBodyInnerWrapper>
              <FormikDoubleDatePicker />

              <MultiCheckColumns>
                <FormikMultiCheckbox
                  isErrorMessageHidden
                  isInline
                  isRequired
                  label="Types de mission"
                  name="missionTypes"
                  options={MISSION_TYPES_AS_OPTIONS}
                />

                <IsUnderJdpFormikCheckbox isUndefinedWhenDisabled label="Mission sous JDP" name="isUnderJdp" />
              </MultiCheckColumns>

              <FormikMultiRadio isInline label="Ordre de mission" name="hasMissionOrder" options={BOOLEAN_AS_OPTIONS} />
            </CustomFormBodyInnerWrapper>

            <FormikMultiControlUnitPicker
              missionId={missionId}
              name="controlUnits"
              validateBeforeOnChange={validateBeforeOnChange(validateForm)}
            />

            <CustomFormBodyInnerWrapper>
              <FormikLocationPicker />

              <RelatedFieldGroupWrapper>
                <FormikTextarea label="CACEM : orientations, observations" name="observationsCacem" rows={2} />
                <FormikTextarea label="CNSP : orientations, observations" name="observationsCnsp" rows={2} />
              </RelatedFieldGroupWrapper>

              <InlineFieldGroupWrapper>
                <FormikTextInput label="Ouvert par" name="openBy" />
                <FormikTextInput label="Complété par" name="completedBy" />
              </InlineFieldGroupWrapper>
            </CustomFormBodyInnerWrapper>
          </FormBody>
        </Wrapper>
      )}
    </Formik>
  )
}

/**
 * @description
 * This component is fully memoized because we want its parent (`<MissionForm />`) to fully control
 * when to re-create this component, the component would be re-render when :
 * - The `key` prop is modified (the edited mission `id` changes).
 */
export const MainForm = memo(UnmemoizedMainForm, () => true)

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
  max-width: 465px;
  width: 36.34%;
  overflow-y: auto;

  /* TODO Handle that in @mtes-mct/monitor-ui. */
  legend {
    font-weight: 400;
  }
`

const CustomFormBodyInnerWrapper = styled(FormBodyInnerWrapper)`
  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 24px;
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
