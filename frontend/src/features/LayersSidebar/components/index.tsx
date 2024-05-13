import { assertNotNullish } from '@utils/assertNotNullish'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { NamespaceContext } from '../../../context/NamespaceContext'
import { MapBox } from '../../../domain/entities/map/constants'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { AdministrativeZones } from '../../AdministrativeZone/components/AdministrativeZones'
import { BaseMaps } from '../../BaseMap/components/BaseMaps'
import { MapComponent } from '../../commonStyles/MapComponent'
import { CustomZones } from '../../CustomZone/components/CustomZones'
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

  const [numberOfRegulatoryLayersSaved, setNumberOfRegulatoryLayersSaved] = useState(0)

  useEffect(() => {
    if (leftMapBoxOpened !== MapBox.REGULATIONS) {
      dispatch(closeRegulatoryZoneMetadata())
    }
  }, [dispatch, leftMapBoxOpened])

  return (
    <NamespaceContext.Consumer>
      {namespace => (
        <Wrapper data-cy="layers-sidebar-box" style={{ top: openedLeftDialog.topPosition }}>
          <RegulationSearch
            namespace={namespace}
            numberOfRegulatoryLayersSaved={numberOfRegulatoryLayersSaved}
            setNumberOfRegulatoryLayersSaved={setNumberOfRegulatoryLayersSaved}
          />
          <Layers hasHealthcheckTextWarning={!!healthcheckTextWarning.length}>
            <RegulatoryZones namespace={namespace} regulatoryLayersAddedToMySelection={numberOfRegulatoryLayersSaved} />
            <CustomZones namespace={namespace} />
            <AdministrativeZones namespace={namespace} />
            <BaseMaps namespace={namespace} />
          </Layers>
          <RegulatoryZoneMetadataShifter
            isLeftMapBoxOpened={!!leftMapBoxOpened}
            isOpen={regulatoryZoneMetadataPanelIsOpen}
          >
            <RegulatoryZoneMetadata />
          </RegulatoryZoneMetadataShifter>
        </Wrapper>
      )}
    </NamespaceContext.Consumer>
  )
}

const Wrapper = styled(MapComponent)`
  border-radius: 2px;
  background-color: ${p => p.theme.color.white};
  left: 64px;
  position: absolute;
  transition: all 0.5s;
  width: 320px;
`

const RegulatoryZoneMetadataShifter = styled.div<{
  isLeftMapBoxOpened: boolean
  isOpen: boolean
}>`
  position: absolute;
  margin-left: ${p => {
    if (!p.isOpen) {
      return -455
    }

    return p.isLeftMapBoxOpened ? 355 : 371
  }}px;
  margin-top: 45px;
  top: 0px;
  opacity: ${p => (p.isOpen ? 1 : 0)};
  background: linear-gradient(${COLORS.gainsboro} 70%, rgb(0, 0, 0, 0));
  z-index: -1;
  transition: all 0.5s;
`

const Layers = styled.div<{
  hasHealthcheckTextWarning: boolean
}>`
  margin-top: 5px;
  width: 350px;
  max-height: calc(100vh - ${p => (p.hasHealthcheckTextWarning ? '210px' : '160px')});
`
