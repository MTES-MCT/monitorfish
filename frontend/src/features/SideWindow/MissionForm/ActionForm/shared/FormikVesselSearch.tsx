import { useField } from 'formik'
import { useCallback } from 'react'
import styled from 'styled-components'

import { useNewWindow } from '../../../../../ui/NewWindow'
import { VesselSearch } from '../../../../VesselSearch'

import type { VesselIdentity } from '../../../../../domain/entities/vessel/types'

export type FormikVesselSearchProps = {
  name: string
}
export function FormikVesselSearch({ name }: FormikVesselSearchProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_input, , helper] = useField<number | undefined>(name)

  const { newWindowContainerRef } = useNewWindow()

  const onSelectVessel = useCallback(
    (nextValue: VesselIdentity) => {
      if (!nextValue || !nextValue.vesselId) {
        return
      }

      helper.setValue(nextValue.vesselId)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const onUnselectVessel = useCallback(
    () => {
      helper.setValue(undefined)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <StyledVesselSearch
      baseRef={newWindowContainerRef}
      // TODO We can't have a default vessel by ID? Which would be more logical by the way for this type of field.
      defaultValue={undefined}
      extendedWidth={400}
      hasVesselIdInResults
      isExtended
      isLastSearchedVesselsShowed={false}
      onClickOutsideOrEscape={() => {}}
      onInputClick={() => {}}
      onSelectVessel={onSelectVessel}
      onUnselectVessel={onUnselectVessel}
    />
  )
}

const StyledVesselSearch = styled(VesselSearch)`
  width: auto;
`
