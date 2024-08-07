import { useFormikContext } from 'formik'
import { useEffect, useRef } from 'react'

import type { Promisable } from 'type-fest'

/**
 * This hook is used to trigger an effect when the formik form is dirty for the first time.
 *
 * It's useful after destroying a Formik form component and re-creating it from previously unsaved values.
 * It can be saved in a Redux slice, for example, and then rehydrated when the form is re-created.
 */
export function useFormikDirtyOnceEffect(onChange: (isDirty: boolean) => Promisable<void>) {
  const dirtyRef = useRef(false)
  const { dirty } = useFormikContext()

  useEffect(() => {
    if (dirtyRef.current === dirty || !dirty) {
      return
    }

    dirtyRef.current = dirty

    onChange(dirty)
  }, [dirty, onChange])
}
