import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { NamespaceContext } from '../../../context/NamespaceContext'
import { MapBox } from '../../../domain/entities/map/constants'
import { setLeftMapBoxOpened } from '../../../domain/shared_slices/Global'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { AdministrativeZones } from '../../AdministrativeZone/components/AdministrativeZones'
import { BaseMaps } from '../../BaseMap/components/BaseMaps'
import { MapButton } from '../../commonStyles/MapButton'
import { MapComponent } from '../../commonStyles/MapComponent'
import { CustomZones } from '../../CustomZone/components/CustomZones'
import LayersSVG from '../../icons/Couches.svg?react'
import { RegulationSearch } from '../../Regulation/components/RegulationSearch'
import { RegulatoryZoneMetadata } from '../../Regulation/components/RegulatoryZoneMetadata'
import { RegulatoryZones } from '../../Regulation/components/RegulatoryZones'
import { closeRegulatoryZoneMetadata } from '../../Regulation/useCases/closeRegulatoryZoneMetadata'

export function LayersSidebar() {
  const dispatch = useMainAppDispatch()
  const regulatoryZoneMetadataPanelIsOpen = useMainAppSelector(
    state => state.regulatory.regulatoryZoneMetadataPanelIsOpen
  )
  const healthcheckTextWarning = useMainAppSelector(state => state.global.healthcheckTextWarning)
  const leftMapBoxOpened = useMainAppSelector(state => state.global.leftMapBoxOpened)
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)

  const [numberOfRegulatoryLayersSaved, setNumberOfRegulatoryLayersSaved] = useState(0)

  useEffect(() => {
    if (leftMapBoxOpened !== MapBox.REGULATIONS) {
      dispatch(closeRegulatoryZoneMetadata())
    }
  }, [dispatch, leftMapBoxOpened])

  return (
    <NamespaceContext.Consumer>
      {namespace => (
        <>
          <Button
            data-cy="layers-sidebar"
            isHidden={!!previewFilteredVesselsMode}
            isVisible={leftMapBoxOpened === MapBox.REGULATIONS || regulatoryZoneMetadataPanelIsOpen}
            onClick={() =>
              dispatch(setLeftMapBoxOpened(leftMapBoxOpened === MapBox.REGULATIONS ? undefined : MapBox.REGULATIONS))
            }
            title="Couches réglementaires"
          >
            <LayersIcon />
          </Button>
          <Sidebar
            data-cy="layers-sidebar-box"
            isOpen={leftMapBoxOpened === MapBox.REGULATIONS}
            isVisible={leftMapBoxOpened === MapBox.REGULATIONS || regulatoryZoneMetadataPanelIsOpen}
          >
            <RegulationSearch
              namespace={namespace}
              numberOfRegulatoryLayersSaved={numberOfRegulatoryLayersSaved}
              setNumberOfRegulatoryLayersSaved={setNumberOfRegulatoryLayersSaved}
            />
            <Layers hasHealthcheckTextWarning={!!healthcheckTextWarning.length}>
              <RegulatoryZones
                namespace={namespace}
                regulatoryLayersAddedToMySelection={numberOfRegulatoryLayersSaved}
              />
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
          </Sidebar>
        </>
      )}
    </NamespaceContext.Consumer>
  )
}

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

const Sidebar = styled(MapComponent)<{
  isOpen: boolean
  isVisible: boolean
}>`
  margin-left: ${p => (p.isOpen ? 0 : '-418px')};
  opacity: ${p => (p.isVisible ? 1 : 0)};
  top: 10px;
  left: 57px;
  z-index: 999;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: 0.5s all;
`

const Layers = styled.div<{
  hasHealthcheckTextWarning: boolean
}>`
  margin-top: 5px;
  width: 350px;
  max-height: calc(100vh - ${p => (p.hasHealthcheckTextWarning ? '210px' : '160px')});
`

const Button = styled(MapButton)<{
  isVisible: boolean
}>`
  position: absolute;
  display: inline-block;
  color: ${COLORS.blue};
  background: ${p => (p.isVisible ? p.theme.color.blueGray : p.theme.color.charcoal)};
  padding: 2px 2px 2px 2px;
  top: 10px;
  left: 10px;
  border-radius: 2px;
  height: 40px;
  width: 40px;

  :hover,
  :focus {
    background: ${p => (p.isVisible ? p.theme.color.blueGray : p.theme.color.charcoal)};
  }
`

const LayersIcon = styled(LayersSVG)`
  width: 35px;
  height: 35px;
`
