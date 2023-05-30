import { useField } from 'formik'
import { useEffect } from 'react'

import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'

export function FormikIsClosedEffect() {
  const [, , helper] = useField('isClosed')
  const { mission } = useMainAppSelector(store => store)

  useEffect(
    () => {
      if (!mission.draft) {
        return
      }

      helper.setValue(mission.draft.mainFormValues.isClosed)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mission.draft?.mainFormValues.isClosed]
  )

  return <></>
}
