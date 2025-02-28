import { MapToolBox } from '@features/MainWindow/components/MapButtons/shared/MapToolBox'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { Accent, Icon, MapMenuDialog } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { FilterBar } from './FilterBar'
import { Item } from './Item'
import { getFilters } from './utils'
import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '../../../../api/constants'
import { displayedComponentActions } from '../../../../domain/shared_slices/DisplayedComponent'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FrontendApiError } from '../../../../libs/FrontendApiError'
import { isNotArchived } from '../../../../utils/isNotArchived'
import { useGetControlUnitsQuery } from '../../controlUnitApi'

export function ControlUnitListDialog() {
  const dispatch = useMainAppDispatch()
  const filtersState = useMainAppSelector(store => store.controlUnitListDialog.filtersState)
  const isStationLayerDisplayed = useMainAppSelector(store => store.displayedComponent.isStationLayerDisplayed)
  const isControlUnitListDialogDisplayed = useMainAppSelector(
    state => state.displayedComponent.isControlUnitListDialogDisplayed
  )
  const { data: controlUnits, error: getControlUnitsError } = useGetControlUnitsQuery(
    undefined,
    RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS
  )
  const { isOpened, isRendered } = useDisplayMapBox(isControlUnitListDialogDisplayed)

  const close = () => {
    dispatch(displayedComponentActions.setDisplayedComponents({ isControlUnitListDialogDisplayed: false }))
  }

  FrontendApiError.handleIfAny(getControlUnitsError)

  const activeControlUnits = useMemo(() => controlUnits?.filter(isNotArchived), [controlUnits])

  const filteredControlUnits = useMemo(() => {
    if (!activeControlUnits) {
      return undefined
    }

    const filters = getFilters(activeControlUnits, filtersState)

    return filters.reduce((previousControlUnits, filter) => filter(previousControlUnits), activeControlUnits)
  }, [activeControlUnits, filtersState])

  const toggleStationLayer = () => {
    dispatch(
      displayedComponentActions.setDisplayedComponents({
        isStationLayerDisplayed: !isStationLayerDisplayed
      })
    )
  }

  return (
    isRendered && (
      <Wrapper $isOpen={isOpened} $isTransparent>
        <MapMenuDialog.Container style={{ margin: '0' }}>
          <MissionsMenuHeader>
            <MapMenuDialog.CloseButton Icon={Icon.Close} onClick={close} />
            <MapMenuDialog.Title>Unités de contrôle</MapMenuDialog.Title>
            <MapMenuDialog.VisibilityButton
              accent={Accent.SECONDARY}
              Icon={isStationLayerDisplayed ? Icon.Display : Icon.Hide}
              onClick={toggleStationLayer}
              title={isStationLayerDisplayed ? 'Masquer les bases' : 'Afficher les bases'}
            />
          </MissionsMenuHeader>
          <MapMenuDialog.Body>
            <FilterBar />
            {filteredControlUnits &&
              filteredControlUnits.map(controlUnit => <Item key={controlUnit.id} controlUnit={controlUnit} />)}
          </MapMenuDialog.Body>
        </MapMenuDialog.Container>
      </Wrapper>
    )
  )
}

const MissionsMenuHeader = styled(MapMenuDialog.Header)`
  height: 40px;
  flex-shrink: 0;
  padding: 0 5px 0 5px;
`

const Wrapper = styled(MapToolBox)`
  top: 76px;
`
