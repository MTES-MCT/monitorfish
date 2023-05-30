import { usePrevious } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { isEqual } from 'lodash/fp'
import { useEffect } from 'react'

import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'

/**
 * Triggers Formik validation when main form values are updated.
 */
export function FormikRevalidationEffect() {
  const { validateForm } = useFormikContext()
  const { mission } = useMainAppSelector(store => store)
  const previousDraft = usePrevious(mission.draft)

  useEffect(
    () => {
      if (isEqual(previousDraft, mission.draft)) {
        return
      }

      validateForm()
    },

    // We don't want to trigger infinite re-renders since `validateForm` changes after each rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mission.draft, previousDraft]
  )

  return <></>
}
