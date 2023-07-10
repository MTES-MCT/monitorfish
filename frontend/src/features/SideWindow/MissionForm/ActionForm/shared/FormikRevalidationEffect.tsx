import { useFormikContext } from 'formik'
import { useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'

/**
 * Triggers Formik validation when mission form start/end date is updated.
 *
 * @description
 * We use this "hook" in `<ActionForm />` in order to retrigger main form-related validation rules.
 */
export function FormikRevalidationEffect() {
  const { validateForm } = useFormikContext()
  const mission = useMainAppSelector(store => store.mission)

  const debouncedValidateForm = useDebouncedCallback(validateForm, 250)

  useEffect(
    () => {
      debouncedValidateForm()
    },

    // We don't want to trigger infinite re-renders since `validateForm` changes after each rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mission.draft?.mainFormValues?.endDateTimeUtc, mission.draft?.mainFormValues?.startDateTimeUtc]
  )

  return <></>
}
