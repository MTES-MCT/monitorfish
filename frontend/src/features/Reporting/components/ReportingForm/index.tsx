import { WindowContext } from '@api/constants'
import { CreateOrEditReportingSchema } from '@features/Reporting/components/ReportingForm/schemas'
import { getFormFields } from '@features/Reporting/components/ReportingForm/utils'
import { autoSaveReporting } from '@features/Reporting/useCases/autoSaveReporting'
import { buildReportingCreation } from '@features/Reporting/useCases/utils'
import { extractVesselIdentityProps } from '@features/Vessel/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { toFormikValidationSchema } from '@utils/toFormikValidationSchema'
import { Formik } from 'formik'
import { useCallback, useEffect, useRef, type MutableRefObject } from 'react'

import { Form } from './Form'
import { addReporting } from '../../useCases/addReporting'
import { updateReporting } from '../../useCases/updateReporting'

import type { FormEditedReporting, Reporting } from '../../types'
import type { Vessel } from '@features/Vessel/Vessel.types'

type ReportingFormProps = {
  autoSave?: boolean
  className?: string | undefined
  editedReporting: Reporting.EditableReporting | undefined
  hasWhiteBackground?: boolean
  hideButtons?: boolean
  onAutoSaved?: ((reporting: Reporting.Reporting) => void) | undefined
  onClose: () => void
  onIsDirty?: ((isDirty: boolean) => void) | undefined
  onVesselStateChange?: (vesselName: string | undefined, flagState: string | undefined) => void
  submitRef?: MutableRefObject<(() => Promise<void>) | undefined>
  vesselIdentity?: Vessel.VesselIdentity | undefined
  windowContext: WindowContext
}
export function ReportingForm({
  autoSave = false,
  className,
  editedReporting,
  hasWhiteBackground = false,
  hideButtons = false,
  onAutoSaved,
  onClose,
  onIsDirty,
  onVesselStateChange,
  submitRef,
  vesselIdentity,
  windowContext
}: ReportingFormProps) {
  const dispatch = useMainAppDispatch()
  const autoSavedReportingRef = useRef<Reporting.Reporting | undefined>(undefined)

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

  const handleAutoSave = useCallback(
    async (nextReporting: FormEditedReporting) => {
      const created = await dispatch(
        autoSaveReporting(
          nextReporting,
          autoSavedReportingRef.current,
          editedReporting?.id,
          vesselIdentity,
          windowContext
        )
      )

      if (created) {
        autoSavedReportingRef.current = created
        onAutoSaved?.(created)
      }
    },
    [dispatch, editedReporting?.id, onAutoSaved, vesselIdentity, windowContext]
  )

  const createOrEditReporting = useCallback(
    async (nextReporting: FormEditedReporting) => {
      const effectiveId = editedReporting?.id ?? autoSavedReportingRef.current?.id
      const effectiveSource = editedReporting ?? autoSavedReportingRef.current

      if (effectiveId && effectiveSource) {
        await dispatch(
          updateReporting(
            extractVesselIdentityProps(effectiveSource),
            effectiveId,
            nextReporting,
            effectiveSource.type,
            windowContext
          )
        )

        handleClose()

        return
      }

      dispatch(addReporting(buildReportingCreation(nextReporting, vesselIdentity)))

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
        hideButtons={hideButtons}
        onAutoSave={autoSave ? handleAutoSave : undefined}
        onClose={handleClose}
        onIsDirty={onIsDirty}
        onVesselStateChange={onVesselStateChange}
        submitRef={submitRef}
        vesselIdentity={vesselIdentity}
      />
    </Formik>
  )
}
