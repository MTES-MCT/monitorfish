import { ControlUnit, MapMenuDialog, type Station } from '@mtes-mct/monitor-ui'
import { uniq } from 'lodash/fp'
import { useCallback, useEffect, useState, type Ref, forwardRef } from 'react'
import styled from 'styled-components'

import { Item } from './Item'
import { OverlayCard } from '../../../../components/OverlayCard'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { FrontendError } from '../../../../libs/FrontendError'
import { NoRsuiteOverrideWrapper } from '../../../../ui/NoRsuiteOverrideWrapper'
import { monitorenvControlUnitApi } from '../../../ControlUnit/controlUnitApi'
import { stationActions } from '../../slice'

type StationCardProps = {
  isSelected?: boolean
  station: Station.Station
}
function StationCardWithRef({ isSelected = false, station }: StationCardProps, ref: Ref<HTMLDivElement>) {
  const [controlUnits, setControlUnits] = useState<ControlUnit.ControlUnit[]>([])

  const dispatch = useMainAppDispatch()

  const close = () => {
    dispatch(stationActions.highlightStationIds([]))
    dispatch(stationActions.selectStationId(undefined))
  }

  const updateControlUnits = useCallback(async () => {
    const controlUnitIds = uniq(
      station.controlUnitResources.map(controlUnitResource => controlUnitResource.controlUnitId)
    )

    const controlUnitsFromApi = await Promise.all(
      controlUnitIds.map(async controlUnitResourceId => {
        const { data: controlUnit } = await dispatch(
          monitorenvControlUnitApi.endpoints.getControlUnit.initiate(controlUnitResourceId)
        )
        if (!controlUnit) {
          throw new FrontendError('`controlUnit` is undefined.')
        }

        return controlUnit
      })
    )
    setControlUnits(controlUnitsFromApi)
  }, [dispatch, station])

  useEffect(() => {
    updateControlUnits()
  }, [updateControlUnits])

  return (
    <NoRsuiteOverrideWrapper>
      <OverlayCard data-cy="StationOverlay-card" isCloseButtonHidden={!isSelected} onClose={close} title={station.name}>
        <StyledMapMenuDialogBody ref={ref}>
          {controlUnits.map(controlUnit => (
            <Item key={controlUnit.id} controlUnit={controlUnit} stationId={station.id} />
          ))}
        </StyledMapMenuDialogBody>
      </OverlayCard>
    </NoRsuiteOverrideWrapper>
  )
}

const StyledMapMenuDialogBody = styled(MapMenuDialog.Body)`
  height: 294px;

  > div:not(:first-child) {
    margin-top: 8px;
  }
`

export const StationCard = forwardRef(StationCardWithRef)
