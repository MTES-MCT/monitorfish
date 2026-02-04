import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { MapBox } from '@features/Map/constants'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'

import { MapSettings } from './MapSettings'
import { setRightMapBoxDisplayed } from '../../../../domain/use_cases/setRightMapBoxDisplayed'

export function MapSettingsButton() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.VESSEL_VISIBILITY)

  const openOrCloseVesselVisibility = () => {
    if (isOpened) {
      dispatch(setRightMapBoxDisplayed(undefined))

      return
    }

    dispatch(setRightMapBoxDisplayed(MapBox.VESSEL_VISIBILITY))
  }

  return (
    <>
      <MapToolButton
        data-cy="vessel-visibility"
        Icon={Icon.MapSettings}
        isActive={isOpened}
        onClick={openOrCloseVesselVisibility}
        title="Affichage des dernières positions"
      />
      {isRendered && <MapSettings isOpened={isOpened} onClose={openOrCloseVesselVisibility} />}
    </>
  )
}
