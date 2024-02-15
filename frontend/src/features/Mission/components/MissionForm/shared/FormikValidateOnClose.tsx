import { useDeepCompareEffect } from '@hooks/useDeepCompareEffect'
import { useFormikContext } from 'formik'

/**
 * Triggers Formik validation when the mission form is closed.
 */
export function FormikValidateOnClose({ isClosing }) {
  const { validateForm } = useFormikContext()

  useDeepCompareEffect(
    () => {
      validateForm()
    },

    // We don't want to trigger infinite re-renders since `setFieldValue` changes after each rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isClosing]
  )

  return <></>
}
