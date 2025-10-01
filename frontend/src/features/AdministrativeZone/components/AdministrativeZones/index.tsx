import { StyledTransparentButton, Title } from '@features/LayersSidebar/components/style'
import { LayerType } from '@features/Map/constants'
import { layerActions } from '@features/Map/layer.slice'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { AdministrativeZone } from './AdministrativeZone'
import { AdministrativeZonesGroup } from './AdministrativeZonesGroup'
import { COLORS } from '../../../../constants/constants'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { ChevronIconButton } from '../../../commonStyles/icons/ChevronIconButton'
import { hideLayer } from '../../../LayersSidebar/useCases/hideLayer'
import { closeRegulatoryZoneMetadata } from '../../../Regulation/useCases/closeRegulatoryZoneMetadata'
import { getAdministrativeZones } from '../../useCases/getAdministrativeZones'

import type { GroupedZonesAndZones } from '../../useCases/getAdministrativeZones'
import type { MonitorFishMap } from '@features/Map/Map.types'

export type AdministrativeZonesProps = Readonly<{
  hideLayersListWhenSearching?: boolean
}>

export function AdministrativeZones({ hideLayersListWhenSearching = false }: AdministrativeZonesProps) {
  const dispatch = useMainAppDispatch()
  const showedLayers = useMainAppSelector(state => state.layer.showedLayers)
  const layersSidebarOpenedLayerType = useMainAppSelector(state => state.layer.layersSidebarOpenedLayerType)

  const [isOpened, setIsOpened] = useState(false)
  const { isOpened: isListOpened, isRendered } = useDisplayMapBox(isOpened)

  const [zones, setZones] = useState<GroupedZonesAndZones>({ groupedZones: [], zones: [] })
  const zonesLength = useMemo(() => zones.zones.length + zones.groupedZones.length, [zones])

  useEffect(() => {
    const fetch = async () => {
      const nextZones = await dispatch(getAdministrativeZones())
      setZones(nextZones)
    }

    fetch()
  }, [dispatch])

  useEffect(() => {
    setIsOpened(layersSidebarOpenedLayerType === LayerType.ADMINISTRATIVE)
  }, [layersSidebarOpenedLayerType, setIsOpened])

  useEffect(() => {
    if (hideLayersListWhenSearching) {
      setIsOpened(false)
    }
  }, [hideLayersListWhenSearching])

  // TODO Simplify this callback with a direct call to the action rather than a function-wrapper.
  const showOrHideZone = useCallback(
    (zone: MonitorFishMap.ShowableLayer) => (isShown: boolean) => {
      if (isShown) {
        dispatch(
          hideLayer({
            id: undefined,
            topic: undefined,
            type: zone.hasFetchableZones ? zone.group?.code!! : zone.code,
            zone: zone.hasFetchableZones ? zone.code : undefined
          })
        )

        return
      }

      dispatch(
        layerActions.addShowedLayer({
          type: zone.hasFetchableZones ? zone.group?.code!! : zone.code,
          zone: zone.hasFetchableZones ? zone.code : undefined
        })
      )
    },
    [dispatch]
  )

  const onSectionTitleClicked = () => {
    if (isOpened) {
      dispatch(layerActions.setLayersSideBarOpenedLayerType(undefined))
    } else {
      dispatch(layerActions.setLayersSideBarOpenedLayerType(LayerType.ADMINISTRATIVE))
      dispatch(closeRegulatoryZoneMetadata())
    }
  }

  return (
    <>
      <Title $isOpen={isListOpened} data-cy="administrative-zones-open">
        <StyledTransparentButton onClick={onSectionTitleClicked}>Zones administratives</StyledTransparentButton>
        <ChevronIconButton isOpen={isListOpened} onClick={onSectionTitleClicked} />
      </Title>
      {isRendered && (
        <List $isOpened={isListOpened} $zonesLength={zonesLength}>
          {zones.zones.map(zone => (
            <Row key={zone.code}>
              <AdministrativeZone
                isShown={showedLayers.some(showedZone => showedZone.type === zone.code)}
                showOrHideZone={showOrHideZone(zone)}
                zone={zone}
              />
            </Row>
          ))}
          {zones.groupedZones.map(groupedZones => (
            <Row key={groupedZones.group.code}>
              <AdministrativeZonesGroup
                group={groupedZones.group}
                showOrHideZone={showOrHideZone}
                zones={groupedZones.zones}
              />
            </Row>
          ))}
        </List>
      )}
    </>
  )
}

const List = styled.ul<{
  $isOpened: boolean
  $zonesLength: number
}>`
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  max-height: 48vh;
  height: ${p => (p.$isOpened && p.$zonesLength ? 36 * p.$zonesLength : 0)}px;
  background: ${COLORS.white};
  transition: 0.5s all;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`

const Row = styled.li`
  line-height: 18px;
  text-align: left;
  list-style-type: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  cursor: pointer;
  color: ${COLORS.gunMetal};
  border-bottom: 1px solid ${COLORS.lightGray};
`
