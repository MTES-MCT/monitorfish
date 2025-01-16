import { WindowContext } from '@api/constants'
import { CreateOrEditReportingSchema } from '@features/Reporting/components/ReportingForm/schemas'
import { getFormFields, getReportingValue } from '@features/Reporting/components/ReportingForm/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Formik } from 'formik'
import { useCallback, useEffect } from 'react'

import { Form } from './Form'
import { getOnlyVesselIdentityProperties } from '../../../../domain/entities/vessel/vessel'
import { addReporting } from '../../useCases/addReporting'
import { updateReporting } from '../../useCases/updateReporting'

import type { VesselIdentity } from '../../../../domain/entities/vessel/types'
import type { EditedReporting, Reporting } from '../../types'

type ReportingFormProps = {
  className?: string | undefined
  editedReporting: Reporting.EditableReporting | undefined
  hasWhiteBackground?: boolean
  onClose: () => void
  onIsDirty?: ((isDirty: boolean) => void) | undefined
  vesselIdentity: VesselIdentity
  windowContext: WindowContext
}
export function ReportingForm({
  className,
  editedReporting,
  hasWhiteBackground = false,
  onClose,
  onIsDirty,
  vesselIdentity,
  windowContext
}: ReportingFormProps) {
  const dispatch = useMainAppDispatch()

  const handleClose = useCallback(() => {
    if (onIsDirty) {
      onIsDirty(false)
    }

    onClose()
  }, [onClose, onIsDirty])

  const createOrEditReporting = useCallback(
    async (reportingValue: EditedReporting) => {
      const nextReportingValue = getReportingValue(reportingValue)

      if (editedReporting?.id) {
        await dispatch(
          updateReporting(
            getOnlyVesselIdentityProperties(editedReporting),
            editedReporting.id,
            nextReportingValue,
            editedReporting.type,
            windowContext
          )
        )

        handleClose()

        return
      }

      const nextReportingWithMissingProperties = {
        creationDate: new Date().toISOString(),
        externalReferenceNumber: vesselIdentity.externalReferenceNumber,
        flagState: vesselIdentity.flagState.toUpperCase(),
        internalReferenceNumber: vesselIdentity.internalReferenceNumber,
        ircs: vesselIdentity.ircs,
        type: nextReportingValue.type,
        validationDate: null,
        expirationDate: null,
        value: {
          ...nextReportingValue
        },
        vesselId: vesselIdentity.vesselId ?? null,
        vesselIdentifier: vesselIdentity.vesselIdentifier ?? null,
        vesselName: vesselIdentity.vesselName ?? null
      }

      dispatch(addReporting(nextReportingWithMissingProperties))

      handleClose()
    },
    [dispatch, editedReporting, handleClose, vesselIdentity, windowContext]
  )

  useEffect(
    () => () => {
      if (onIsDirty) {
        onIsDirty(false)
      }
    },
    [onIsDirty]
  )

  return (
    <Formik
      initialValues={getFormFields(editedReporting?.value, editedReporting?.type, editedReporting?.expirationDate)}
      onSubmit={createOrEditReporting}
      validationSchema={CreateOrEditReportingSchema}
    >
      <Form
        className={className}
        hasWhiteBackground={hasWhiteBackground}
        onClose={handleClose}
        onIsDirty={onIsDirty}
        windowContext={windowContext}
      />
    </Formik>
  )
}
