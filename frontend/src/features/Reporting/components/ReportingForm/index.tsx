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
    async (nextReporting: EditedReporting) => {
      if (editedReporting?.id) {
        await dispatch(
          updateReporting(
            getOnlyVesselIdentityProperties(editedReporting),
            editedReporting.id,
            nextReporting,
            editedReporting.type,
            windowContext
          )
        )

        handleClose()

        return
      }

      const nextReportingValue = getReportingValue(nextReporting)
      const nextReportingWithMissingProperties = {
        creationDate: new Date().toISOString(),
        expirationDate: nextReporting.expirationDate,
        externalReferenceNumber: vesselIdentity.externalReferenceNumber ?? undefined,
        flagState: vesselIdentity.flagState.toUpperCase(),
        internalReferenceNumber: vesselIdentity.internalReferenceNumber ?? undefined,
        ircs: vesselIdentity.ircs ?? undefined,
        type: nextReporting.type,
        validationDate: undefined,
        value: nextReportingValue,
        vesselId: vesselIdentity.vesselId ?? undefined,
        vesselIdentifier: vesselIdentity.vesselIdentifier ?? undefined,
        vesselName: vesselIdentity.vesselName ?? undefined
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
