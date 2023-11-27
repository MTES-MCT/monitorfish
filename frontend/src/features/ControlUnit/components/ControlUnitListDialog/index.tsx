import { Accent, Icon, MapMenuDialog } from '@mtes-mct/monitor-ui'
import { noop } from 'lodash/fp'
import { useCallback, useMemo } from 'react'

import { FilterBar } from './FilterBar'
import { Item } from './Item'
import { getFilters } from './utils'
import { RTK_COMMON_QUERY_OPTIONS } from '../../../../api/constants'
import { displayedComponentActions } from '../../../../domain/shared_slices/DisplayedComponent'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FrontendApiError } from '../../../../libs/FrontendApiError'
import { NoRsuiteOverrideWrapper } from '../../../../ui/NoRsuiteOverrideWrapper'
import { isNotArchived } from '../../../../utils/isNotArchived'
import { useGetControlUnitsQuery } from '../../controlUnitApi'

export function ControlUnitListDialog() {
  const dispatch = useMainAppDispatch()
  const filtersState = useMainAppSelector(store => store.controlUnitListDialog.filtersState)
  const { data: controlUnits, error: getControlUnitsError } = useGetControlUnitsQuery(
    undefined,
    RTK_COMMON_QUERY_OPTIONS
  )
  FrontendApiError.handleIfAny(getControlUnitsError)

  const activeControlUnits = useMemo(() => controlUnits?.filter(isNotArchived), [controlUnits])

  const filteredControlUnits = useMemo(() => {
    if (!activeControlUnits) {
      return undefined
    }

    const filters = getFilters(activeControlUnits, filtersState)

    return filters.reduce((previousControlUnits, filter) => filter(previousControlUnits), activeControlUnits)
  }, [activeControlUnits, filtersState])

  const close = useCallback(() => {
    dispatch(displayedComponentActions.setDisplayedComponents({ isControlUnitListDialogDisplayed: false }))
  }, [dispatch])

  return (
    <NoRsuiteOverrideWrapper>
      <MapMenuDialog.Container style={{ height: 480, position: 'absolute', right: 50, top: 118 }}>
        <MapMenuDialog.Header>
          <MapMenuDialog.CloseButton Icon={Icon.Close} onClick={close} />
          <MapMenuDialog.Title>Unités de contrôle</MapMenuDialog.Title>
          <MapMenuDialog.VisibilityButton
            accent={Accent.SECONDARY}
            Icon={Icon.Display}
            onClick={noop}
            style={{ visibility: 'hidden' }}
          />
        </MapMenuDialog.Header>
        <MapMenuDialog.Body>
          <FilterBar />

          {filteredControlUnits &&
            filteredControlUnits.map(controlUnit => <Item key={controlUnit.id} controlUnit={controlUnit} />)}
        </MapMenuDialog.Body>
      </MapMenuDialog.Container>
    </NoRsuiteOverrideWrapper>
  )
}
