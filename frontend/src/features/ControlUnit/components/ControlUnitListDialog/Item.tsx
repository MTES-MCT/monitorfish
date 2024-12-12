import { monitorfishMap } from '@features/Map/monitorfishMap'
import { IconButton, type ControlUnit, Accent, Icon } from '@mtes-mct/monitor-ui'
import { property, uniqBy } from 'lodash/fp'
import { fromLonLat } from 'ol/proj'
import styled from 'styled-components'

import {
  displayControlUnitResourcesFromControlUnit,
  displayBaseNamesFromControlUnit,
  getBufferedExtentFromStations
} from './utils'
import { displayedComponentActions } from '../../../../domain/shared_slices/DisplayedComponent'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FrontendError } from '../../../../libs/FrontendError'
import { mapActions } from '../../../Map/slice'
import { stationActions } from '../../../Station/slice'
import { controlUnitDialogActions } from '../ControlUnitDialog/slice'

const FIVE_SECONDS = 5000

export type ItemProps = {
  controlUnit: ControlUnit.ControlUnit
}
export function Item({ controlUnit }: ItemProps) {
  const dispatch = useMainAppDispatch()
  const isStationLayerDisplayed = useMainAppSelector(state => state.displayedComponent.isStationLayerDisplayed)

  const center = () => {
    const highlightedStations = uniqBy(
      property('id'),
      controlUnit.controlUnitResources.map(({ station }) => station)
    )

    const highlightedStationIds = highlightedStations.map(station => station.id)

    if (highlightedStations.length === 1) {
      const station = highlightedStations[0]
      if (!station) {
        throw new FrontendError('`station` is undefined.')
      }

      const stationCoordinates = fromLonLat([station.longitude, station.latitude])

      // Add this as a `monitorfishMap` method (vanilla).
      monitorfishMap.getView().animate({ center: stationCoordinates })
    } else {
      const bufferedHighlightedStationsExtent = getBufferedExtentFromStations(highlightedStations, 0.5)

      // Move this indirect method to `monitorfishMap` (vanilla).
      dispatch(mapActions.fitToExtent(bufferedHighlightedStationsExtent))
    }

    dispatch(stationActions.highlightStationIds(highlightedStationIds))
    setTimeout(() => {
      dispatch(stationActions.highlightStationIds([]))
    }, FIVE_SECONDS)
  }

  const edit = () => {
    dispatch(controlUnitDialogActions.setControlUnitId(controlUnit.id))
    dispatch(
      displayedComponentActions.setDisplayedComponents({
        isControlUnitDialogDisplayed: true,
        isControlUnitListDialogDisplayed: false
      })
    )
  }

  return (
    <Wrapper data-cy="ControlUnitListDialog-control-unit" data-id={controlUnit.id} onClick={edit}>
      <Head>
        <NameText>{controlUnit.name}</NameText>

        {isStationLayerDisplayed && (
          <IconButton
            accent={Accent.TERTIARY}
            disabled={!controlUnit.controlUnitResources.length}
            Icon={Icon.FocusZones}
            iconSize={18}
            isCompact
            onClick={center}
            withUnpropagatedClick
          />
        )}
      </Head>
      <AdministrationText>{controlUnit.administration.name}</AdministrationText>
      <ResourcesAndPortsText>{displayControlUnitResourcesFromControlUnit(controlUnit)}</ResourcesAndPortsText>
      <ResourcesAndPortsText>{displayBaseNamesFromControlUnit(controlUnit)}</ResourcesAndPortsText>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  cursor: pointer;
  margin-top: 8px;
  padding: 8px 8px 8px 12px;

  &:hover {
    background-color: ${p => p.theme.color.lightGray};
  }
`

const Head = styled.div`
  display: flex;
  justify-content: space-between;
`

const NameText = styled.div`
  color: ${p => p.theme.color.gunMetal};
  font-weight: bold;
  line-height: 18px;
`

const AdministrationText = styled.div`
  color: ${p => p.theme.color.gunMetal};
  line-height: 18px;
  margin: 2px 0 8px;
`

const ResourcesAndPortsText = styled.div`
  color: ${p => p.theme.color.slateGray};
  line-height: 18px;
`
