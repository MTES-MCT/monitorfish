import { MapToolButton } from '@features/MainWindow/components/MapButtons/shared/MapToolButton'
import { SideWindowMenuKey, SideWindowStatus } from '@features/SideWindow/constants'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { countVesselListFilter } from '@features/Vessel/components/VesselList/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'

export function VesselListMapButton() {
  const dispatch = useMainAppDispatch()
  const sideWindow = useMainAppSelector(state => state.sideWindow)
  const listFilterValues = useMainAppSelector(store => store.vessel.listFilterValues)
  const numberOfFilters = countVesselListFilter(listFilterValues)

  const isActive =
    sideWindow.status !== SideWindowStatus.CLOSED && sideWindow.selectedPath.menu === SideWindowMenuKey.VESSEL_LIST

  const toggleSideWindow = () => {
    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.VESSEL_LIST }))
  }

  return (
    <MapToolButton
      badgeNumber={numberOfFilters || undefined}
      data-cy="vessel-list"
      Icon={Icon.VesselList}
      isActive={isActive}
      onClick={toggleSideWindow}
      style={{ top: 76 }}
      title="Liste des navires avec VMS"
    />
  )
}
