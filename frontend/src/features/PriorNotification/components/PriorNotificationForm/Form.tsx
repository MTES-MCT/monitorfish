import { useGetFaoAreasAsOptions } from '@hooks/useGetFaoAreasAsOptions'
import { useGetGearsAsOptions } from '@hooks/useGetGearsAsOptions'
import { useGetPortsAsOptions } from '@hooks/useGetPortsAsOptions'
import {
  FormikCheckbox,
  FormikDatePicker,
  FormikMultiSelect,
  FormikSelect,
  FormikTextInput,
  FormikTextarea
} from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import { FormikFishingCatchesMultiSelect } from './fields/FormikFishingCatchesMultiSelect'
import { FormikVesselSelect } from './fields/FormikVesselSelect'

import type { FormValues } from './types'

export function Form() {
  const { values } = useFormikContext<FormValues>()

  const { faoAreasAsOptions } = useGetFaoAreasAsOptions()
  const { gearsAsOptions } = useGetGearsAsOptions()
  const { portsAsOptions } = useGetPortsAsOptions()

  return (
    <>
      <FormikVesselSelect />

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

  textarea {
    box-sizing: border-box !important;
  }
`
