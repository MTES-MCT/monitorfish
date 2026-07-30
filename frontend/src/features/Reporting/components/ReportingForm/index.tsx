import { WindowContext } from '@api/constants'
import { CreateOrEditReportingSchema } from '@features/Reporting/components/ReportingForm/schemas'
import { getFormFields } from '@features/Reporting/components/ReportingForm/utils'
import { autoSaveReporting } from '@features/Reporting/useCases/autoSaveReporting'
import { toReportingPayload } from '@features/Reporting/useCases/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { toFormikValidationSchema } from '@utils/toFormikValidationSchema'
import { Formik } from 'formik'
import { useCallback, useEffect, useRef, type MutableRefObject } from 'react'

import { Form } from './Form'
import { addReporting } from '../../useCases/addReporting'
import { updateReporting } from '../../useCases/updateReporting'

import type { ReportingFormActions } from './Form'
import type { FormEditedReporting, Reporting } from '../../types'

export type { ReportingFormActions }

export type ReportingFormDuplication = {
  initialValues: FormEditedReporting
  /** Incremented on each duplication to mount a form free of the previous reporting state. */
  revision: number
}

type ReportingFormProps = {
  autoSave?: boolean
  className?: string | undefined
  duplication?: ReportingFormDuplication | undefined
  editedReporting: Reporting.EditableReporting | undefined
  formActionsRef?: MutableRefObject<ReportingFormActions | undefined>
  hasWhiteBackground?: boolean
  hideButtons?: boolean
  hideVesselSection?: boolean
  isIUU?: boolean
  onAutoSaved?: ((reporting: Reporting.Reporting) => void) | undefined
  onClose: () => void
  onIsDirty?: ((isDirty: boolean) => void) | undefined
  onVesselStateChange?: (
    vesselName: string | undefined,
    flagState: string | undefined,
    numberOfVessels: number | undefined
  ) => void
  windowContext: WindowContext
}
export function ReportingForm({
  autoSave = false,
  className,
  duplication,
  editedReporting,
  formActionsRef,
  hasWhiteBackground = false,
  hideButtons = false,
  hideVesselSection = false,
  isIUU = false,
  onAutoSaved,
  onClose,
  onIsDirty,
  onVesselStateChange,
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

      dispatch(addReporting(toReportingPayload(nextReporting, isIUU)))

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

  // A duplication starts a new reporting, as does the edition of another one
  useEffect(() => {
    autoSavedReportingRef.current = undefined
  }, [duplication?.revision, editedReporting?.id])

  return (
    <Formik
      key={duplication ? `duplication-${duplication.revision}` : (editedReporting?.id ?? 'new')}
      initialValues={duplication?.initialValues ?? getFormFields(editedReporting, isIUU)}
      onSubmit={createOrEditReporting}
      validate={toFormikValidationSchema(CreateOrEditReportingSchema)}
    >
      <Form
        className={className}
        displayedErrorKey={displayedErrorKey}
        formActionsRef={formActionsRef}
        hasWhiteBackground={hasWhiteBackground}
        hideButtons={hideButtons}
        hideVesselSection={hideVesselSection}
        isEdition={!!editedReporting?.id}
        isIUU={isIUU}
        onAutoSave={autoSave ? handleAutoSave : undefined}
        onClose={handleClose}
        onIsDirty={onIsDirty}
        onVesselStateChange={onVesselStateChange}
      />
    </Formik>
  )
}
