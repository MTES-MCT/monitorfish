import { WindowContext } from '@api/constants'
import { CreateOrEditReportingSchema } from '@features/Reporting/components/ReportingForm/schemas'
import { getFormFields } from '@features/Reporting/components/ReportingForm/utils'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { extractVesselIdentityProps } from '@features/Vessel/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Formik } from 'formik'
import { useCallback, useEffect } from 'react'

import { Form } from './Form'
import { addReporting } from '../../useCases/addReporting'
import { updateReporting } from '../../useCases/updateReporting'

import type { FormEditedReporting, Reporting, ReportingCreation } from '../../types'
import type { ReportingOriginActor } from '@features/Reporting/types/ReportingOriginActor'
import type { Vessel } from '@features/Vessel/Vessel.types'

type ReportingFormProps = {
  className?: string | undefined
  editedReporting: Reporting.EditableReporting | undefined
  hasWhiteBackground?: boolean
  onClose: () => void
  onIsDirty?: ((isDirty: boolean) => void) | undefined
  vesselIdentity: Vessel.VesselIdentity
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
    async (nextReporting: FormEditedReporting) => {
      if (editedReporting?.id) {
        await dispatch(
          updateReporting(
            extractVesselIdentityProps(editedReporting),
            editedReporting.id,
            nextReporting,
            editedReporting.type,
            windowContext
          )
        )

        handleClose()

        return
      }

      const nextReportingWithMissingProperties: ReportingCreation = {
        authorContact: nextReporting.authorContact,
        controlUnit: nextReporting.controlUnit,
        controlUnitId: nextReporting.controlUnitId,
        creationDate: new Date().toISOString(),
        description: nextReporting.description,
        expirationDate: nextReporting.expirationDate,
        externalReferenceNumber: vesselIdentity.externalReferenceNumber ?? undefined,
        flagState: vesselIdentity.flagState.toUpperCase(),
        internalReferenceNumber: vesselIdentity.internalReferenceNumber ?? undefined,
        ircs: vesselIdentity.ircs ?? undefined,
        reportingActor: nextReporting.reportingActor as ReportingOriginActor,
        threatHierarchy:
          nextReporting.type === ReportingType.INFRACTION_SUSPICION ? nextReporting.threatHierarchy : undefined,
        title: nextReporting.title as string,
        type: nextReporting.type,
        validationDate: undefined,
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
      <Form className={className} hasWhiteBackground={hasWhiteBackground} onClose={handleClose} onIsDirty={onIsDirty} />
    </Formik>
  )
}
