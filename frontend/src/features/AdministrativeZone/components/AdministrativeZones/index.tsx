import { mainMapActions } from '@features/MainMap/slice'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { AdministrativeZone } from './AdministrativeZone'
import { AdministrativeZonesGroup } from './AdministrativeZonesGroup'
import { COLORS } from '../../../../constants/constants'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { ChevronIcon } from '../../../commonStyles/icons/ChevronIcon.style'
import { hideLayer } from '../../../LayersSidebar/useCases/hideLayer'
import { LayerType } from '../../../MainMap/constants'
import { closeRegulatoryZoneMetadata } from '../../../Regulation/useCases/closeRegulatoryZoneMetadata'
import { getAdministrativeZones } from '../../useCases/getAdministrativeZones'

import type { GroupedZonesAndZones } from '../../useCases/getAdministrativeZones'
import type { MainMap } from '@features/MainMap/MainMap.types'

export type AdministrativeZonesProps = Readonly<{
  hideLayersListWhenSearching?: boolean
}>
export function AdministrativeZones({ hideLayersListWhenSearching = false }: AdministrativeZonesProps) {
  const dispatch = useMainAppDispatch()
  const showedLayers = useMainAppSelector(state => state.mainMap.showedLayers)
  const layersSidebarOpenedLayerType = useMainAppSelector(state => state.mainMap.layersSidebarOpenedLayerType)

  const [isOpened, setIsOpened] = useState(false)
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
    (zone: MainMap.ShowableLayer) => (isShown: boolean) => {
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
        dispatch(
          mainMapActions.addShowedLayer({
            type: zone.hasFetchableZones ? zone.group?.code!! : zone.code,
            zone: zone.hasFetchableZones ? zone.code : undefined
          })
        )
      )
    },
    [dispatch]
  )

  const onSectionTitleClicked = () => {
    if (isOpened) {
      dispatch(mainMapActions.setLayersSideBarOpenedLayerType(undefined))
    } else {
      dispatch(mainMapActions.setLayersSideBarOpenedLayerType(LayerType.ADMINISTRATIVE))
      dispatch(closeRegulatoryZoneMetadata())
    }
  }

  return (
    <>
      <SectionTitle $isOpened={isOpened} data-cy="administrative-zones-open" onClick={onSectionTitleClicked}>
        Zones administratives <ChevronIcon $isOpen={isOpened} />
      </SectionTitle>
      <List $isOpened={isOpened} $zonesLength={zonesLength}>
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
    </>
  )
}

const SectionTitle = styled.div<{
  $isOpened: boolean
}>`
  height: 30px;
  padding-left: 20px;
  padding-top: 5px;
  font-size: 16px;
  cursor: pointer;
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  text-align: left;
  user-select: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  border-bottom-left-radius: ${p => (p.$isOpened ? '0' : '2px')};
  border-bottom-right-radius: ${p => (p.$isOpened ? '0' : '2px')};

  .Element-IconBox {
    float: right;
    margin-top: 4px;
  }
`

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
