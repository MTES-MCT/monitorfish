import { BOOLEAN_AS_OPTIONS } from '@constants/index'
import { getHasAuthorizedLandingDownload } from '@features/PriorNotification/components/shared/DownloadButton/utils'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { priorNotificationActions } from '@features/PriorNotification/slice'
import { useFormikDirtyOnceEffect } from '@hooks/useFormikDirtyOnceEffect'
import { useGetGearsAsOptions } from '@hooks/useGetGearsAsOptions'
import { useGetPortsAsOptions } from '@hooks/useGetPortsAsOptions'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import {
  FormikCheckbox,
  FormikDatePicker,
  FormikMultiRadio,
  FormikMultiSelect,
  FormikSelect,
  FormikTextarea,
  getOptionsFromLabelledEnum,
  LinkButton
} from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useRef } from 'react'
import styled from 'styled-components'

import { FormikFaoAreaSelect } from './fields/FormikFaoAreaSelect'
import { FormikFishingCatchesMultiSelect } from './fields/FormikFishingCatchesMultiSelect'
import { FormikVesselSelect } from './fields/FormikVesselSelect'

import type { ManualPriorNotificationFormValues } from './types'
import type { VesselIdentity } from '../../../../domain/entities/vessel/types'

type FormProps = Readonly<{
  isNewPriorNotification: boolean
  isReadOnly: boolean
}>
export function Form({ isNewPriorNotification, isReadOnly }: FormProps) {
  const { values } = useFormikContext<ManualPriorNotificationFormValues>()

  const dispatch = useMainAppDispatch()
  const { gearsAsOptions } = useGetGearsAsOptions()
  const { portsAsOptions } = useGetPortsAsOptions()

  const isThirdPartyVessel = useRef<boolean>(false)

  const onChange = (nextVessel: VesselIdentity | undefined) => {
    if (getHasAuthorizedLandingDownload(nextVessel?.flagState, nextVessel?.externalReferenceNumber)) {
      isThirdPartyVessel.current = true

      return
    }

    isThirdPartyVessel.current = false
  }

  const openVesselReportingList = () => {
    dispatch(priorNotificationActions.setIsReportingListOpened(true))
  }

  const updateIsDirty = (isDirty: boolean) => {
    dispatch(priorNotificationActions.setIsPriorNotificationFormDirty(isDirty))
  }

  useFormikDirtyOnceEffect(updateIsDirty)

  return (
    <>
      <FormikVesselSelect onChange={onChange} readOnly={isReadOnly} />

      <FormikSelect
        isCleanable={false}
        label="Raison du préavis"
        name="purpose"
        options={getOptionsFromLabelledEnum(PriorNotification.PURPOSE_LABEL)}
        readOnly={isReadOnly}
      />

      <FormikDatePicker
        isStringDate
        label="Date et heure de réception du préavis (UTC)"
        name="sentAt"
        readOnly={isReadOnly}
        withTime
      />

      <FormikDatePicker
        isStringDate
        label="Date et heure estimées d'arrivée au port (UTC)"
        name="expectedArrivalDate"
        readOnly={isReadOnly}
        withTime
      />

      <FieldGroup>
        <FormikDatePicker
          disabled={values.isExpectedLandingDateSameAsExpectedArrivalDate}
          isStringDate
          label="Date et heure prévues de débarque (UTC)"
          name="expectedLandingDate"
          readOnly={isReadOnly}
          withTime
        />
        <FormikCheckbox
          label="équivalentes à celles de l'arrivée au port"
          name="isExpectedLandingDateSameAsExpectedArrivalDate"
          readOnly={isReadOnly}
        />
      </FieldGroup>

      <FormikSelect
        disabled={!portsAsOptions}
        label="Port d'arrivée"
        name="portLocode"
        options={portsAsOptions ?? []}
        readOnly={isReadOnly}
        searchable
        virtualized
      />

      <FormikFaoAreaSelect isReadOnly={isReadOnly} />

      <FormikFishingCatchesMultiSelect isReadOnly={isReadOnly} />

      <FormikMultiSelect
        disabled={!gearsAsOptions}
        label="Engins utilisés"
        name="tripGearCodes"
        options={gearsAsOptions ?? []}
        readOnly={isReadOnly}
        searchable
        virtualized
      />

      <hr />

      {isThirdPartyVessel.current && (
        <>
          <StyledFormikMultiRadio
            isInline
            label="Autorisation d'entrée au port"
            name="hasPortEntranceAuthorization"
            options={BOOLEAN_AS_OPTIONS}
            readOnly={isReadOnly}
          />
          <StyledFormikMultiRadio
            isInline
            label="Autorisation de débarquement"
            name="hasPortLandingAuthorization"
            options={BOOLEAN_AS_OPTIONS}
            readOnly={isReadOnly}
          />
        </>
      )}

      <FieldGroup>
        <FormikTextarea label="Points d'attention identifiés par le CNSP" name="note" readOnly={isReadOnly} />

        {!isNewPriorNotification && (
          <LinkButton onClick={openVesselReportingList}>Ouvrir un signalement sur le navire</LinkButton>
        )}
      </FieldGroup>
    </>
  )
}

const StyledFormikMultiRadio = styled(FormikMultiRadio)`
  legend {
    margin-bottom: 8px;
  }
`

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
