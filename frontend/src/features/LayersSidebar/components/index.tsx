import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Icon, IconButton, Size, THEME } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useEffect } from 'react'
import styled from 'styled-components'

import { NamespaceContext } from '../../../context/NamespaceContext'
import { MapBox } from '../../../domain/entities/map/constants'
import { AdministrativeZones } from '../../AdministrativeZone/components/AdministrativeZones'
import { BaseMaps } from '../../BaseMap/components/BaseMaps'
import { MapComponent } from '../../commonStyles/MapComponent'
import { CustomZones } from '../../CustomZone/components/CustomZones'
import { MapButton } from '../../MainWindow/components/MapButtons/MapButton'
import { setLeftMapBoxOpened } from '../../MainWindow/slice'
import { RegulationSearch } from '../../Regulation/components/RegulationSearch'
import { RegulatoryZoneMetadata } from '../../Regulation/components/RegulatoryZoneMetadata'
import { RegulatoryZones } from '../../Regulation/components/RegulatoryZones'
import { closeRegulatoryZoneMetadata } from '../../Regulation/useCases/closeRegulatoryZoneMetadata'

export function LayersSidebar() {
  const dispatch = useMainAppDispatch()
  const regulatoryZoneMetadataPanelIsOpen = useMainAppSelector(
    state => state.regulatory.regulatoryZoneMetadataPanelIsOpen
  )
  const openedLeftDialog = useMainAppSelector(state => state.mainWindow.openedLeftDialog)
  assertNotNullish(openedLeftDialog)
  const healthcheckTextWarning = useMainAppSelector(state => state.mainWindow.healthcheckTextWarning)
  const leftMapBoxOpened = useMainAppSelector(state => state.mainWindow.leftMapBoxOpened)

  useEffect(() => {
    if (leftMapBoxOpened !== MapBox.REGULATIONS) {
      dispatch(closeRegulatoryZoneMetadata())
    }
  }, [dispatch, leftMapBoxOpened])

  return (
    <NamespaceContext.Consumer>
      {namespace => (
        <>
          <SidebarLayersButton>
            <SidebarLayersIcon
              $isActive={leftMapBoxOpened === MapBox.REGULATIONS || regulatoryZoneMetadataPanelIsOpen}
              accent={Accent.PRIMARY}
              aria-label="Arbre des couches"
              Icon={Icon.MapLayers}
              onClick={() =>
                dispatch(setLeftMapBoxOpened(leftMapBoxOpened === MapBox.REGULATIONS ? undefined : MapBox.REGULATIONS))
              }
              size={Size.LARGE}
              title="Arbre des couches"
            />
          </SidebarLayersButton>
          <Sidebar
            $isOpen={leftMapBoxOpened === MapBox.REGULATIONS}
            $isVisible={leftMapBoxOpened === MapBox.REGULATIONS || regulatoryZoneMetadataPanelIsOpen}
            data-cy="layers-sidebar-box"
          >
            <RegulationSearch namespace={namespace} />
            <Layers $hasHealthcheckTextWarning={!!healthcheckTextWarning.length}>
              <RegulatoryZones namespace={namespace} />
              <CustomZones namespace={namespace} />
              <AdministrativeZones namespace={namespace} />
              <BaseMaps namespace={namespace} />
            </Layers>
            <RegulatoryZoneMetadataShifter
              $isLeftMapBoxOpened={!!leftMapBoxOpened}
              $isOpen={regulatoryZoneMetadataPanelIsOpen}
            >
              <RegulatoryZoneMetadata />
            </RegulatoryZoneMetadataShifter>
          </Sidebar>
        </>
      )}
    </NamespaceContext.Consumer>
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

const SidebarLayersButton = styled(MapButton)`
  position: absolute;
  top: 10px;
  left: 10px;
`

const SidebarLayersIcon = styled(IconButton)<{ $isActive: boolean }>`
  border-radius: 2px;
  width: 40px;
  height: 40px;
  ${p => (p.$isActive ? `background: ${p.theme.color.blueGray};` : '')}
  ${p => (p.$isActive ? `border-color: ${p.theme.color.blueGray};` : '')}
`
