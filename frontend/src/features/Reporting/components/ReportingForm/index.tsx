import { WindowContext } from '@api/constants'
import { CreateOrEditReportingSchema } from '@features/Reporting/components/ReportingForm/schemas'
import { getFormFields } from '@features/Reporting/components/ReportingForm/utils'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { extractVesselIdentityProps } from '@features/Vessel/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { toFormikValidationSchema } from '@utils/toFormikValidationSchema'
import { Formik } from 'formik'
import { useCallback, useEffect } from 'react'

import { Form } from './Form'
import { addReporting } from '../../useCases/addReporting'
import { updateReporting } from '../../useCases/updateReporting'

import type { FormEditedReporting, Reporting, ReportingCreation } from '../../types'
import type { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import type { Vessel } from '@features/Vessel/Vessel.types'

type ReportingFormProps = {
  className?: string | undefined
  editedReporting: Reporting.EditableReporting | undefined
  hasWhiteBackground?: boolean
  onClose: () => void
  onIsDirty?: ((isDirty: boolean) => void) | undefined
  vesselIdentity?: Vessel.VesselIdentity | undefined
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

  const displayedErrorKey =
    windowContext === WindowContext.MainWindow
      ? DisplayedErrorKey.MAIN_WINDOW_REPORTING_FORM_ERROR
      : DisplayedErrorKey.SIDE_WINDOW_REPORTING_FORM_ERROR

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
        externalMarker: vesselIdentity?.externalReferenceNumber ?? nextReporting.externalMarker,
        flagState: (vesselIdentity?.flagState ?? nextReporting.flagState ?? '').toUpperCase(),
        cfr: vesselIdentity?.internalReferenceNumber ?? nextReporting.cfr,
        imo: nextReporting.imo,
        ircs: vesselIdentity?.ircs ?? nextReporting.ircs,
        length: nextReporting.length,
        mmsi: nextReporting.mmsi,
        reportingSource: nextReporting.reportingSource as ReportingOriginSource,
        threatHierarchy:
          nextReporting.type === ReportingType.INFRACTION_SUSPICION ? nextReporting.threatHierarchy : undefined,
        title: nextReporting.title as string,
        type: nextReporting.type,
        validationDate: undefined,
        vesselId: vesselIdentity?.vesselId ?? nextReporting.vesselId,
        vesselIdentifier: vesselIdentity?.vesselIdentifier ?? nextReporting.vesselIdentifier,
        vesselName: vesselIdentity?.vesselName ?? nextReporting.vesselName
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
      initialValues={getFormFields(editedReporting)}
      onSubmit={createOrEditReporting}
      validate={toFormikValidationSchema(CreateOrEditReportingSchema)}
    >
      <Form
        className={className}
        displayedErrorKey={displayedErrorKey}
        hasWhiteBackground={hasWhiteBackground}
        onClose={handleClose}
        onIsDirty={onIsDirty}
        vesselIdentity={vesselIdentity}
      />
    </Formik>
  )
}
