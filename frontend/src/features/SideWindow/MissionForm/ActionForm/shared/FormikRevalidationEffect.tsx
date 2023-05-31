import { useFormikContext } from 'formik'
import { useDebouncedCallback } from 'use-debounce'

import { useDeepCompareEffect } from '../../../../../hooks/useDeepCompareEffect'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'

/**
 * Triggers Formik validation when main form values are updated.
 *
 * @description
 * We use this "hook" in `<ActionForm />` in order to retrigger main form-related validation rules.
 */
export function FormikRevalidationEffect() {
  const { validateForm } = useFormikContext()
  const { mission } = useMainAppSelector(store => store)

  const debouncedValidateForm = useDebouncedCallback(validateForm, 250)

  useDeepCompareEffect(
    () => {
      debouncedValidateForm()
    },

    // We don't want to trigger infinite re-renders since `validateForm` changes after each rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mission.draft?.mainFormValues]
  )

  return <></>
}
