import { StyledTransparentButton, Title } from '@features/LayersSidebar/components/style'
import { layerActions } from '@features/Map/layer.slice'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { THEME } from '@mtes-mct/monitor-ui'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { AdministrativeZone } from './AdministrativeZone'
import { AdministrativeZonesGroup } from './AdministrativeZonesGroup'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { ChevronIconButton } from '../../../commonStyles/icons/ChevronIconButton'
import { closeRegulatoryZoneMetadata } from '../../../Regulation/useCases/closeRegulatoryZoneMetadata'
import { getAdministrativeZones } from '../../useCases/getAdministrativeZones'

import type { GroupedZonesAndZones } from '../../useCases/getAdministrativeZones'

const ADMINISTRATIVE_LAYER_TYPE = 'ADMINISTRATIVE'

export type AdministrativeZonesProps = Readonly<{
  hideLayersListWhenSearching?: boolean
}>

export function AdministrativeZones({ hideLayersListWhenSearching = false }: AdministrativeZonesProps) {
  const dispatch = useMainAppDispatch()
  const showedLayers = useMainAppSelector(state => state.layer.showedLayers)
  const layersSidebarOpenedLayerType = useMainAppSelector(state => state.layer.layersSidebarOpenedLayerType)

  const isOpened = !hideLayersListWhenSearching && layersSidebarOpenedLayerType === ADMINISTRATIVE_LAYER_TYPE
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

  const onSectionTitleClicked = () => {
    if (isOpened) {
      dispatch(layerActions.setLayersSideBarOpenedLayerType(undefined))
    } else {
      dispatch(layerActions.setLayersSideBarOpenedLayerType(ADMINISTRATIVE_LAYER_TYPE))
      dispatch(closeRegulatoryZoneMetadata())
    }
  }

  return (
    <>
      <Title $isOpen={isListOpened}>
        <StyledTransparentButton onClick={onSectionTitleClicked}>Zones administratives</StyledTransparentButton>
        <ChevronIconButton isOpen={isListOpened} onClick={onSectionTitleClicked} />
      </Title>
      {isRendered && (
        <List $isOpened={isListOpened} $zonesLength={zonesLength}>
          {zones.zones.map(zone => (
            <Row key={zone.code}>
              <AdministrativeZone
                isShown={showedLayers.some(showedZone => showedZone.type === zone.code)}
                zone={zone}
              />
            </Row>
          ))}
          {zones.groupedZones.map(groupedZones => (
            <Row key={groupedZones.group.code}>
              <AdministrativeZonesGroup group={groupedZones.group} zones={groupedZones.zones} />
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
  background: ${THEME.color.white};
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
  color: ${THEME.color.gunMetal};
  border-bottom: 1px solid ${THEME.color.lightGray};
`
