import {
  FormikCheckbox,
  FormikEffect,
  FormikMultiCheckbox,
  FormikMultiRadio,
  FormikTextarea,
  FormikTextInput
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop, omit } from 'lodash/fp'
import { useMemo } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { MISSION_TYPES_AS_OPTIONS } from './constants'
import { FormikDoubleDatePicker } from './FormikDoubleDatePicker'
import { FormikIsClosedEffect } from './FormikIsClosedEffect'
import { FormikLocationPicker } from './FormikLocationPicker'
import { FormikMultiControlUnitPicker } from './FormikMultiControlUnitPicker'
import { BOOLEAN_AS_OPTIONS } from '../../../../constants'
import { missionActions } from '../../../../domain/actions'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FrontendError } from '../../../../libs/FrontendError'
import { FormBody, FormBodyInnerWrapper } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionFormValues } from '../types'

export function MainForm() {
  const { mission } = useMainAppSelector(store => store)
  const dispatch = useMainAppDispatch()

  const initialMissionFormValues = useMemo(() => {
    if (!mission.draft) {
      throw new FrontendError('`mission.draft` is undefined')
    }

    return omit(['actions'], mission.draft)
  }, [mission.draft])

  const handleMainFormChange = useDebouncedCallback((nextMissionFormValues: MissionFormValues) => {
    dispatch(missionActions.setDraft(nextMissionFormValues))
  }, 250)

  return (
    <Formik initialValues={initialMissionFormValues} onSubmit={noop}>
      <Wrapper>
        <FormikEffect onChange={handleMainFormChange as any} />

        <FormHead>
          <h2>Informations générales</h2>
        </FormHead>

        <FormBody>
          <CustomFormBodyInnerWrapper>
            <FormikIsClosedEffect />

            <FormikDoubleDatePicker />

            <MultiCheckColumns>
              <FormikMultiCheckbox
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
