import { useField } from 'formik'
import { RefObject, useMemo } from 'react'

import { VesselSearch } from '../../../../VesselSearch'

export type FormikVesselSearchProps = {
  baseRef: RefObject<HTMLDivElement>
  name: string
}
export function FormikVesselSearch({ baseRef, name }) {
  const [field, , helpers] = useField(name)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultValue = useMemo(() => field.value, [])

  return (
    <VesselSearch
      baseRef={baseRef}
      defaultValue={defaultValue}
      extendedWidth={400}
      isFocused
      onClickOutsideOrEscape={() => {}}
      onInputClick={() => {}}
      onSelectVessel={helpers.setValue}
    />
  )
}
