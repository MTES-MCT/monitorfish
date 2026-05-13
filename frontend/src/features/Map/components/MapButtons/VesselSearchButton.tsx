import { Icon } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'

import { MapToolButton } from './shared/MapToolButton'
import { expandRightMenu } from '../../../../domain/shared_slices/Global'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { setIsFocusedOnVesselSearch } from '../../../Vessel/slice'

export function VesselSearchButton() {
  const dispatch = useMainAppDispatch()
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)

  const handleInputClick = useCallback(() => {
    dispatch(setIsFocusedOnVesselSearch(true))
  }, [dispatch])

  return (
    <MapToolButton
      Icon={Icon.Search}
      isActive={!!selectedVessel}
      onClick={handleInputClick}
      onMouseDown={e => e.stopPropagation()}
      onMouseEnter={() => dispatch(expandRightMenu())}
      title="Rechercher un navire"
    />
  )
}
