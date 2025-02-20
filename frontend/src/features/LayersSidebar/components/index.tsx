import { MapToolButton } from '@features/MainWindow/components/MapButtons/shared/MapToolButton'
import { MapBox } from '@features/Map/constants'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { BaseLayers } from 'features/Map/components/BaseLayers'
import { useEffect } from 'react'
import styled from 'styled-components'

import { setLeftMapBoxOpened } from '../../../domain/shared_slices/Global'
import { AdministrativeZones } from '../../AdministrativeZone/components/AdministrativeZones'
import { MapComponent } from '../../commonStyles/MapComponent'
import { CustomZones } from '../../CustomZone/components/CustomZones'
import { RegulationSearch } from '../../Regulation/components/RegulationSearch'
import { RegulatoryZoneMetadata } from '../../Regulation/components/RegulatoryZoneMetadata'
import { RegulatoryZones } from '../../Regulation/components/RegulatoryZones'
import { closeRegulatoryZoneMetadata } from '../../Regulation/useCases/closeRegulatoryZoneMetadata'

export function LayersSidebar() {
  const dispatch = useMainAppDispatch()
  const regulatoryZoneMetadataPanelIsOpen = useMainAppSelector(
    state => state.regulation.regulatoryZoneMetadataPanelIsOpen
  )
  const healthcheckTextWarning = useMainAppSelector(state => state.global.healthcheckTextWarning)
  const leftMapBoxOpened = useMainAppSelector(state => state.global.leftMapBoxOpened)

  useEffect(() => {
    if (leftMapBoxOpened !== MapBox.REGULATIONS) {
      dispatch(closeRegulatoryZoneMetadata())
    }
  }, [dispatch, leftMapBoxOpened])

  return (
    <>
      <MapToolButton
        Icon={Icon.MapLayers}
        isActive={leftMapBoxOpened === MapBox.REGULATIONS || regulatoryZoneMetadataPanelIsOpen}
        isLeftButton
        onClick={() =>
          dispatch(setLeftMapBoxOpened(leftMapBoxOpened === MapBox.REGULATIONS ? undefined : MapBox.REGULATIONS))
        }
        style={{ top: 10 }}
        title="Arbre des couches"
      />
      <Sidebar
        $isOpen={leftMapBoxOpened === MapBox.REGULATIONS}
        $isVisible={leftMapBoxOpened === MapBox.REGULATIONS || regulatoryZoneMetadataPanelIsOpen}
        data-cy="layers-sidebar-box"
      >
        <RegulationSearch />
        <Layers $hasHealthcheckTextWarning={!!healthcheckTextWarning.length}>
          <RegulatoryZones />
          <CustomZones />
          <AdministrativeZones />
          <BaseLayers />
        </Layers>
        <RegulatoryZoneMetadataShifter
          $isLeftMapBoxOpened={!!leftMapBoxOpened}
          $isOpen={regulatoryZoneMetadataPanelIsOpen}
        >
          <RegulatoryZoneMetadata />
        </RegulatoryZoneMetadataShifter>
      </Sidebar>
    </>
  )
}

const RegulatoryZoneMetadataShifter = styled.div<{
  $isLeftMapBoxOpened: boolean
  $isOpen: boolean
}>`
  position: absolute;
  margin-left: ${p => {
    if (!p.$isOpen) {
      return -455
    }

    return p.$isLeftMapBoxOpened ? 355 : 371
  }}px;
  margin-top: 45px;
  top: 0px;
  opacity: ${p => (p.$isOpen ? 1 : 0)};
  background: linear-gradient(${THEME.color.gainsboro} 70%, rgb(0, 0, 0, 0));
  z-index: -1;
  transition: all 0.5s;
`

const Sidebar = styled(MapComponent)<{
  $isOpen: boolean
  $isVisible: boolean
}>`
  margin-left: ${p => (p.$isOpen ? 0 : '-418px')};
  opacity: ${p => (p.$isVisible ? 1 : 0)};
  top: 10px;
  left: 57px;
  z-index: 999;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: 0.5s all;
`

const Layers = styled.div<{
  $hasHealthcheckTextWarning: boolean
}>`
  margin-top: 5px;
  width: 350px;
  max-height: calc(100vh - ${p => (p.$hasHealthcheckTextWarning ? '210px' : '160px')});
`
