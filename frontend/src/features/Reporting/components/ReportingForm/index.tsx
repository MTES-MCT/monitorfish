import { WindowContext } from '@api/constants'
import { CreateOrEditReportingSchema } from '@features/Reporting/components/ReportingForm/schemas'
import { getFormFields } from '@features/Reporting/components/ReportingForm/utils'
import { autoSaveReporting } from '@features/Reporting/useCases/autoSaveReporting'
import { buildReportingCreation } from '@features/Reporting/useCases/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { toFormikValidationSchema } from '@utils/toFormikValidationSchema'
import { Formik } from 'formik'
import { useCallback, useEffect, useRef, type MutableRefObject } from 'react'

import { Form } from './Form'
import { addReporting } from '../../useCases/addReporting'
import { updateReporting } from '../../useCases/updateReporting'

import type { FormEditedReporting, Reporting } from '../../types'

type ReportingFormProps = {
  autoSave?: boolean
  className?: string | undefined
  editedReporting: Reporting.EditableReporting | undefined
  hasWhiteBackground?: boolean
  hideButtons?: boolean
  hideVesselSection?: boolean
  isIUU?: boolean
  onAutoSaved?: ((reporting: Reporting.Reporting) => void) | undefined
  onClose: () => void
  onIsDirty?: ((isDirty: boolean) => void) | undefined
  onVesselStateChange?: (vesselName: string | undefined, flagState: string | undefined) => void
  submitRef?: MutableRefObject<(() => Promise<void>) | undefined>
  windowContext: WindowContext
}
export function ReportingForm({
  autoSave = false,
  className,
  editedReporting,
  hasWhiteBackground = false,
  hideButtons = false,
  hideVesselSection = false,
  isIUU = false,
  onAutoSaved,
  onClose,
  onIsDirty,
  onVesselStateChange,
  submitRef,
  windowContext
}: ReportingFormProps) {
  const dispatch = useMainAppDispatch()
  const autoSavedReportingRef = useRef<Reporting.Reporting | undefined>(undefined)
  const reportingId = editedReporting?.id ?? autoSavedReportingRef.current?.id
  const reporting = editedReporting ?? autoSavedReportingRef.current

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
        autoSaveReporting(nextReporting, autoSavedReportingRef.current, editedReporting?.id, windowContext, isIUU)
      )

      if (created) {
        autoSavedReportingRef.current = created
        onAutoSaved?.(created)
        onIsDirty?.(false)
      }
    },
    [dispatch, editedReporting?.id, isIUU, onIsDirty, onAutoSaved, windowContext]
  )

  const createOrEditReporting = useCallback(
    async (nextReporting: FormEditedReporting) => {
      if (reportingId && reporting) {
        await dispatch(updateReporting(reportingId, nextReporting, reporting.type!, windowContext))

        handleClose()

        return
      }

      dispatch(addReporting(buildReportingCreation(nextReporting, isIUU)))

      handleClose()
    },
    [dispatch, isIUU, reporting, reportingId, handleClose, windowContext]
  )

  useEffect(
    () => () => {
      if (onIsDirty) {
        onIsDirty(false)
      }
    },
    [onIsDirty]
  )

  useEffect(() => {
    autoSavedReportingRef.current = undefined
  }, [editedReporting?.id])

  return (
    <Formik
      key={editedReporting?.id ?? 'new'}
      initialValues={getFormFields(editedReporting, isIUU)}
      onSubmit={createOrEditReporting}
      validate={toFormikValidationSchema(CreateOrEditReportingSchema)}
    >
      <Form
        className={className}
        displayedErrorKey={displayedErrorKey}
        hasWhiteBackground={hasWhiteBackground}
        hideButtons={hideButtons}
        hideVesselSection={hideVesselSection}
        isIUU={isIUU}
        onAutoSave={autoSave ? handleAutoSave : undefined}
        onClose={handleClose}
        onIsDirty={onIsDirty}
        onVesselStateChange={onVesselStateChange}
        submitRef={submitRef}
      />
    </Formik>
  )
}
