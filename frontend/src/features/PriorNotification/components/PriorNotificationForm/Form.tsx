import { BOOLEAN_AS_OPTIONS } from '@constants/index'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { useGetFaoAreasAsOptions } from '@hooks/useGetFaoAreasAsOptions'
import { useGetGearsAsOptions } from '@hooks/useGetGearsAsOptions'
import { useGetPortsAsOptions } from '@hooks/useGetPortsAsOptions'
import {
  FormikCheckbox,
  FormikDatePicker,
  FormikMultiRadio,
  FormikMultiSelect,
  FormikSelect,
  FormikTextarea,
  FormikTextInput,
  getOptionsFromLabelledEnum
} from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useRef } from 'react'
import styled from 'styled-components'

import { FormikFishingCatchesMultiSelect } from './fields/FormikFishingCatchesMultiSelect'
import { FormikVesselSelect } from './fields/FormikVesselSelect'

import type { FormValues } from './types'
import type { VesselIdentity } from '../../../../domain/entities/vessel/types'

export function Form() {
  const { values } = useFormikContext<FormValues>()

  const { faoAreasAsOptions } = useGetFaoAreasAsOptions()
  const { gearsAsOptions } = useGetGearsAsOptions()
  const { portsAsOptions } = useGetPortsAsOptions()

  const isThirdPartyVessel = useRef<boolean>(false)

  const onChange = (nextVessel: VesselIdentity | undefined) => {
    if (nextVessel?.flagState !== 'FR') {
      isThirdPartyVessel.current = true

      return
    }

    isThirdPartyVessel.current = false
  }

  return (
    <>
      <FormikVesselSelect onChange={onChange} />

      <FormikSelect
        isCleanable={false}
        label="Raison du préavis"
        name="purpose"
        options={getOptionsFromLabelledEnum(PriorNotification.PURPOSE_LABEL)}
      />

      <FormikDatePicker isStringDate label="Date et heure de réception du préavis" name="sentAt" withTime />

      <FormikDatePicker
        isStringDate
        label="Date et heure estimées d'arrivée au port"
        name="expectedArrivalDate"
        withTime
      />

      <FieldGroup>
        <FormikDatePicker
          disabled={values.isExpectedLandingDateSameAsExpectedArrivalDate}
          isStringDate
          label="Date et heure prévues de débarque"
          name="expectedLandingDate"
          withTime
        />
        <FormikCheckbox
          label="équivalentes à celles de l'arrivée au port"
          name="isExpectedLandingDateSameAsExpectedArrivalDate"
        />
      </FieldGroup>

      <FormikSelect
        disabled={!portsAsOptions}
        label="Port d'arrivée"
        name="portLocode"
        options={portsAsOptions ?? []}
        searchable
        virtualized
      />

      <FormikFishingCatchesMultiSelect />

      <FormikMultiSelect
        disabled={!gearsAsOptions}
        label="Engins utilisés"
        name="tripGearCodes"
        options={gearsAsOptions ?? []}
        searchable
        virtualized
      />

      <FormikSelect
        disabled={!faoAreasAsOptions}
        label="Zone de pêche"
        name="faoArea"
        options={faoAreasAsOptions ?? []}
        searchable
        virtualized
      />

      <hr />

      {isThirdPartyVessel.current && (
        <>
          <FormikMultiRadio
            isInline
            label="Autorisation d'entrée au port"
            name="hasPortEntranceAuthorization"
            options={BOOLEAN_AS_OPTIONS}
          />
          <FormikMultiRadio
            isInline
            label="Autorisation de débarquement"
            name="hasPortLandingAuthorization"
            options={BOOLEAN_AS_OPTIONS}
          />
        </>
      )}

      <FieldGroup>
        <FormikTextarea label="Points d'attention identifiés par le CNSP" name="note" />
        <FormikCheckbox label="pas de pêche après le préavis zéro" name="didNotFishAfterZeroNotice" />
      </FieldGroup>

      <FormikTextInput label="Saisi par" maxLength={3} name="authorTrigram" />
    </>
  )
}

const FieldGroup = styled.div.attrs({ className: 'FieldGroup' })`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .rs-checkbox {
    > .rs-checkbox-checker {
      > label {
        line-height: 18px;
      }
    }
  }

  textarea {
    box-sizing: border-box !important;
  }
`
