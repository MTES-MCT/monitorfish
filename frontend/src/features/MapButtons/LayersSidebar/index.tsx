import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { AdministrativeZones } from './AdministrativeZones'
import { BaseMaps } from './BaseMaps'
import { RegulatoryZones } from './RegulatoryZones'
import { RegulatoryZoneMetadata } from './RegulatoryZones/RegulatoryZoneMetadata'
import { RegulatoryLayerSearch } from './RegulatoryZones/search/RegulatoryLayerSearch'
import { COLORS } from '../../../constants/constants'
import { NamespaceContext } from '../../../context/NamespaceContext'
import { LeftBoxOpened } from '../../../domain/entities/global'
import { setLeftBoxOpened } from '../../../domain/shared_slices/Global'
import { closeRegulatoryZoneMetadata } from '../../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { MapButtonStyle } from '../../commonStyles/MapButton.style'
import { MapComponentStyle } from '../../commonStyles/MapComponent.style'
import { ReactComponent as LayersSVG } from '../../icons/Couches.svg'

export function LayersSidebar() {
  const dispatch = useMainAppDispatch()
  const { regulatoryZoneMetadataPanelIsOpen } = useMainAppSelector(state => state.regulatory)
  const { healthcheckTextWarning, leftBoxOpened, previewFilteredVesselsMode } = useMainAppSelector(
    state => state.global
  )

  const [numberOfRegulatoryLayersSaved, setNumberOfRegulatoryLayersSaved] = useState(0)

  useEffect(() => {
    if (leftBoxOpened !== LeftBoxOpened.REGULATIONS) {
      dispatch(closeRegulatoryZoneMetadata())
    }
  }, [dispatch, leftBoxOpened])

  return (
    <NamespaceContext.Consumer>
      {namespace => (
        <>
          <Button
            data-cy="layers-sidebar"
            healthcheckTextWarning={!!healthcheckTextWarning}
            isHidden={!!previewFilteredVesselsMode}
            isVisible={leftBoxOpened === LeftBoxOpened.REGULATIONS || regulatoryZoneMetadataPanelIsOpen}
            onClick={() =>
              dispatch(setLeftBoxOpened(leftBoxOpened === LeftBoxOpened.REGULATIONS ? null : LeftBoxOpened.REGULATIONS))
            }
            title="Couches réglementaires"
          >
            <LayersIcon />
          </Button>
          <Sidebar
            data-cy="layers-sidebar-box"
            healthcheckTextWarning={!!healthcheckTextWarning}
            isOpen={leftBoxOpened === LeftBoxOpened.REGULATIONS}
            isVisible={leftBoxOpened === LeftBoxOpened.REGULATIONS || regulatoryZoneMetadataPanelIsOpen}
          >
            <RegulatoryLayerSearch
              namespace={namespace}
              numberOfRegulatoryLayersSaved={numberOfRegulatoryLayersSaved}
              setNumberOfRegulatoryLayersSaved={setNumberOfRegulatoryLayersSaved}
            />
            <Layers healthcheckTextWarning={!!healthcheckTextWarning}>
              <RegulatoryZones
                namespace={namespace}
                regulatoryLayersAddedToMySelection={numberOfRegulatoryLayersSaved}
              />
              <AdministrativeZones namespace={namespace} />
              <BaseMaps namespace={namespace} />
            </Layers>
            <RegulatoryZoneMetadataShifter isLeftBoxOpened={!!leftBoxOpened} isOpen={regulatoryZoneMetadataPanelIsOpen}>
              <RegulatoryZoneMetadata />
            </RegulatoryZoneMetadataShifter>
          </Sidebar>
        </>
      )}
    </NamespaceContext.Consumer>
  )
}

const RegulatoryZoneMetadataShifter = styled.div<{
  isLeftBoxOpened: boolean
  isOpen: boolean
}>`
  position: absolute;
  margin-left: ${p => {
    if (!p.isOpen) {
      return -455
    }

    return p.isLeftBoxOpened ? 355 : 371
  }}px;
  margin-top: 45px;
  top: 0px;
  opacity: ${p => (p.isOpen ? 1 : 0)};
  background: linear-gradient(${COLORS.gainsboro} 70%, rgb(0, 0, 0, 0));
  z-index: -1;
  transition: all 0.5s;
`

const Sidebar = styled(MapComponentStyle)<{
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
  healthcheckTextWarning: boolean
}>`
  margin-top: 5px;
  width: 350px;
  max-height: calc(100vh - ${p => (p.healthcheckTextWarning ? '210px' : '160px')});
`

const Button = styled(MapButtonStyle)<{
  isVisible: boolean
}>`
  position: absolute;
  display: inline-block;
  color: ${COLORS.blue};
  background: ${p => (p.isVisible ? p.theme.color.blueGray[100] : p.theme.color.charcoal)};
  padding: 2px 2px 2px 2px;
  top: 10px;
  left: 10px;
  border-radius: 2px;
  height: 40px;
  width: 40px;

  :hover,
  :focus {
    background: ${p => (p.isVisible ? p.theme.color.blueGray[100] : p.theme.color.charcoal)};
  }
`

const LayersIcon = styled(LayersSVG)`
  width: 35px;
  height: 35px;
`
