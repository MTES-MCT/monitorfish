import { useFormikContext } from 'formik'

import { useDeepCompareEffect } from '../../../../../hooks/useDeepCompareEffect'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'

/**
 * Triggers Formik validation when main form values are updated.
 */
export function FormikRevalidationEffect() {
  const { validateForm } = useFormikContext()
  const { mission } = useMainAppSelector(store => store)

  useDeepCompareEffect(
    () => {
      validateForm()
    },

    // We don't want to trigger infinite re-renders since `validateForm` changes after each rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mission.draft]
  )

  return <></>
}
