import { useDeepCompareEffect } from '@hooks/useDeepCompareEffect'
import { useFormikContext } from 'formik'
import { isEmpty } from 'lodash-es'

/**
 * Triggers Formik validation when main form values are updated.
 *
 * @description
 * We use this "hook" in `<ActionForm />` in order to retrigger main form-related validation rules.
 */
export function FormikIsValidEffect() {
  const { setFieldValue, validateForm, values } = useFormikContext()

  useDeepCompareEffect(
    () => {
      ;(async () => {
        const errors = await validateForm()

        setFieldValue('isValid', isEmpty(errors))
      })()
    },

    // We don't want to trigger infinite re-renders since `setFieldValue` changes after each rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values]
  )

  return <></>
}
