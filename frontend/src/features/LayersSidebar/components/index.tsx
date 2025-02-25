import { MapToolBox } from '@features/MainWindow/components/MapButtons/shared/MapToolBox'
import { MapToolButton } from '@features/MainWindow/components/MapButtons/shared/MapToolButton'
import { MapBox } from '@features/Map/constants'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { BaseLayers } from 'features/Map/components/BaseLayers'
import styled from 'styled-components'

import { setLeftMapBoxOpened } from '../../../domain/shared_slices/Global'
import { AdministrativeZones } from '../../AdministrativeZone/components/AdministrativeZones'
import { CustomZones } from '../../CustomZone/components/CustomZones'
import { RegulationSearch } from '../../Regulation/components/RegulationSearch'
import { RegulatoryZoneMetadata } from '../../Regulation/components/RegulatoryZoneMetadata'
import { RegulatoryZones } from '../../Regulation/components/RegulatoryZones'

export function LayersSidebar() {
  const dispatch = useMainAppDispatch()
  const regulatoryZoneMetadataPanelIsOpen = useMainAppSelector(
    state => state.regulation.regulatoryZoneMetadataPanelIsOpen
  )
  const healthcheckTextWarning = useMainAppSelector(state => state.global.healthcheckTextWarning)
  const leftMapBoxOpened = useMainAppSelector(state => state.global.leftMapBoxOpened)
  const { isOpened: isRegulationSearchOpened, isRendered: isRegulationSearchRendered } = useDisplayMapBox(
    leftMapBoxOpened === MapBox.REGULATIONS
  )
  const { isOpened: isMetadataPanelOpened, isRendered: isMetadataPanelRendered } = useDisplayMapBox(
    regulatoryZoneMetadataPanelIsOpen
  )

  return (
    <>
      <MapToolButton
        Icon={Icon.MapLayers}
        isActive={isRegulationSearchOpened || regulatoryZoneMetadataPanelIsOpen}
        isLeftButton
        onClick={() => dispatch(setLeftMapBoxOpened(isRegulationSearchOpened ? undefined : MapBox.REGULATIONS))}
        style={{ top: 10 }}
        title="Arbre des couches"
      />
      {isRegulationSearchRendered && (
        <Sidebar
          $hideBoxShadow
          $isLeftBox
          $isOpen={isRegulationSearchOpened}
          $isTransparent
          data-cy="layers-sidebar-box"
        >
          <RegulationSearch />
          <Layers $hasHealthcheckTextWarning={!!healthcheckTextWarning.length}>
            <RegulatoryZones />
            <CustomZones />
            <AdministrativeZones />
            <BaseLayers />
          </Layers>
          {isMetadataPanelRendered && (
            <RegulatoryZoneMetadataShifter $isLeftMapBoxOpened={!!leftMapBoxOpened} $isOpen={isMetadataPanelOpened}>
              <RegulatoryZoneMetadata />
            </RegulatoryZoneMetadataShifter>
          )}
        </Sidebar>
      )}
      {!isRegulationSearchRendered && isMetadataPanelRendered && (
        <Sidebar $hideBoxShadow $isLeftBox $isOpen={isMetadataPanelOpened} $isTransparent>
          <RegulatoryZoneMetadataShifter $isLeftMapBoxOpened={!!leftMapBoxOpened} $isOpen={isMetadataPanelOpened}>
            <RegulatoryZoneMetadata />
          </RegulatoryZoneMetadataShifter>
        </Sidebar>
      )}
    </>
  )
}

const RegulatoryZoneMetadataShifter = styled.div<{
  $isLeftMapBoxOpened: boolean
  $isOpen: boolean
}>`
  position: absolute;
  margin-left: ${p => (p.$isLeftMapBoxOpened ? 355 : -45)}px;
  margin-top: 45px;
  top: 0;
  opacity: ${p => (p.$isOpen ? '1' : '0')};
  background: linear-gradient(${THEME.color.gainsboro} 70%, rgb(0, 0, 0, 0));
  z-index: -1;
  transition: all 0.3s;
`

const Sidebar = styled(MapToolBox)`
  top: 10px;
`

const Layers = styled.div<{
  $hasHealthcheckTextWarning: boolean
}>`
  margin-top: 5px;
  width: 350px;
  max-height: calc(100vh - ${p => (p.$hasHealthcheckTextWarning ? '210px' : '160px')});
`
