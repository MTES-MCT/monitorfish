import { logSoftError } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { AdministrativeZone } from './AdministrativeZone'
import { AdministrativeZonesGroup } from './AdministrativeZonesGroup'
import { COLORS } from '../../../../constants/constants'
import { LayerType } from '../../../../domain/entities/layers/constants'
import LayerSlice from '../../../../domain/shared_slices/Layer'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { ChevronIcon } from '../../../commonStyles/icons/ChevronIcon.style'
import { hideLayer } from '../../../LayersSidebar/useCases/hideLayer'
import { closeRegulatoryZoneMetadata } from '../../../Regulation/useCases/closeRegulatoryZoneMetadata'
import { getAdministrativeZones } from '../../useCases/getAdministrativeZones'
import { showAdministrativeZone } from '../../useCases/showAdministrativeZone'

import type { LayerSliceNamespace, ShowableLayer } from '../../../../domain/entities/layers/types'
import type { GroupedZonesAndZones } from '../../useCases/getAdministrativeZones'

export type AdministrativeZonesProps = {
  hideLayersListWhenSearching?: boolean
  namespace: LayerSliceNamespace
}
export function AdministrativeZones({ hideLayersListWhenSearching = false, namespace }: AdministrativeZonesProps) {
  const { setLayersSideBarOpenedLayerType } = LayerSlice[namespace].actions

  const dispatch = useMainAppDispatch()
  const showedLayers = useMainAppSelector(state => state.layer.showedLayers)
  const { layersSidebarOpenedLayerType } = useMainAppSelector(state => state.layer)

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

  const showOrHideZone = useCallback(
    (zone: ShowableLayer) => (isShown: boolean) => {
      if (isShown) {
        dispatch(
          hideLayer({
            namespace,
            type: zone.hasFetchableZones ? zone.group?.code!! : zone.code,
            zone: zone.hasFetchableZones ? zone.code : null
          })
        )

        return
      }

      dispatch(
        showAdministrativeZone({
          namespace,
          type: zone.hasFetchableZones ? zone.group?.code!! : zone.code,
          zone: zone.hasFetchableZones ? zone.code : null
        })
      )
    },
    [namespace, dispatch]
  )

  const onSectionTitleClicked = () => {
    if (!setLayersSideBarOpenedLayerType) {
      logSoftError({
        message: '`setLayersSideBarOpenedLayerType` is undefined.'
      })

      return
    }

    if (isOpened) {
      dispatch(setLayersSideBarOpenedLayerType(undefined))
    } else {
      dispatch(setLayersSideBarOpenedLayerType(LayerType.ADMINISTRATIVE))
      dispatch(closeRegulatoryZoneMetadata())
    }
  }

  return (
    <>
      <SectionTitle data-cy="administrative-zones-open" isOpened={isOpened} onClick={onSectionTitleClicked}>
        Zones administratives <ChevronIcon $isOpen={isOpened} />
      </SectionTitle>
      <List isOpened={isOpened} zonesLength={zonesLength}>
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
  isOpened: boolean
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
  border-bottom-left-radius: ${p => (p.isOpened ? '0' : '2px')};
  border-bottom-right-radius: ${p => (p.isOpened ? '0' : '2px')};

  > div {
    float: right;
    margin-top: 4px;
  }
`

const List = styled.ul<{
  isOpened: boolean
  zonesLength: number
}>`
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  max-height: 48vh;
  height: ${p => (p.isOpened && p.zonesLength ? 36 * p.zonesLength : 0)}px;
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
