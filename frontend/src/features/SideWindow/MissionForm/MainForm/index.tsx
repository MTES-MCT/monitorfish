import {
  FormikCheckbox,
  FormikEffect,
  FormikMultiCheckbox,
  FormikMultiRadio,
  FormikTextarea,
  FormikTextInput
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { isEqual, omit } from 'lodash'
import { isEmpty, noop } from 'lodash/fp'
import { memo } from 'react'
import styled from 'styled-components'

import { MISSION_TYPES_AS_OPTIONS } from './constants'
import { FormikDoubleDatePicker } from './FormikDoubleDatePicker'
import { FormikLocationPicker } from './FormikLocationPicker'
import { FormikMultiControlUnitPicker } from './FormikMultiControlUnitPicker'
import { FormikSyncMissionFields } from './FormikSyncMissionFields'
import { MainFormLiveSchema } from './schemas'
import { BOOLEAN_AS_OPTIONS } from '../../../../constants'
import { useListenToMissionEventUpdatesById } from '../hooks/useListenToMissionEventUpdatesById'
import { FormBody, FormBodyInnerWrapper } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionMainFormValues } from '../types'
import type { Promisable } from 'type-fest'

type MainFormProps = {
  initialValues: MissionMainFormValues
  missionId: number | undefined
  onChange: (nextValues: MissionMainFormValues) => Promisable<void>
}
function UnmemoizedMainForm({ initialValues, missionId, onChange }: MainFormProps) {
  const missionEvent = useListenToMissionEventUpdatesById(missionId)

  function validateBeforeOnChange(validateForm) {
    return async nextValues => {
      const errors = await validateForm()
      const isValid = isEmpty(errors)

      // Prevent triggering `onChange` when opening the form
      if (isEqual(initialValues, nextValues)) {
        return
      }

      // Prevent re-sending the form when receiving an update
      const nextValuesWithoutIsValid = omit(nextValues, ['isValid'])
      if (isEqual(missionEvent, nextValuesWithoutIsValid)) {
        return
      }

      onChange({ ...nextValues, isValid } as any)
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
                  label="Types de mission"
                  name="missionTypes"
                  options={MISSION_TYPES_AS_OPTIONS}
                />

                <IsUnderJdpFormikCheckbox isUndefinedWhenDisabled label="Mission sous JDP" name="isUnderJdp" />
              </MultiCheckColumns>

              <FormikMultiRadio isInline label="Ordre de mission" name="hasMissionOrder" options={BOOLEAN_AS_OPTIONS} />
            </CustomFormBodyInnerWrapper>

            <FormikMultiControlUnitPicker name="controlUnits" />

            <CustomFormBodyInnerWrapper>
              <FormikLocationPicker />

              <RelatedFieldGroupWrapper>
                <FormikTextarea label="CACEM : orientations, observations" name="observationsCacem" rows={2} />
                <FormikTextarea label="CNSP : orientations, observations" name="observationsCnsp" rows={2} />
              </RelatedFieldGroupWrapper>

              <InlineFieldGroupWrapper>
                <FormikTextInput label="Ouvert par" name="openBy" />
                <FormikTextInput label="Clôturé par" name="closedBy" />
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
