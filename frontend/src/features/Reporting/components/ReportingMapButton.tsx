import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { MapBox } from '@features/Map/constants'
import { ReportingMapMenuDialog } from '@features/Reporting/components/ReportingMapMenuDialog'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'

import { setRightMapBoxDisplayed } from '../../../domain/use_cases/setRightMapBoxDisplayed'

export function ReportingMapButton() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)

  const toggleMenu = () => {
    dispatch(setRightMapBoxDisplayed(rightMapBoxOpened === MapBox.REPORTINGS ? undefined : MapBox.REPORTINGS))
  }

  return (
    <>
      <MapToolButton
        badgeBackgroundColor={THEME.color.gainsboro}
        Icon={Icon.Report}
        iconSize={25}
        isActive={rightMapBoxOpened === MapBox.REPORTINGS}
        onClick={toggleMenu}
        style={{ color: THEME.color.gainsboro }}
        title="Signalements"
      />
      <ReportingMapMenuDialog />
    </>
  )
}
