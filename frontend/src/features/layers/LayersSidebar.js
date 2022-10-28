import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import NamespaceContext from '../../domain/context/NamespaceContext'
import { LeftBoxOpened } from '../../domain/entities/global'
import { setLeftBoxOpened } from '../../domain/shared_slices/Global'
import closeRegulatoryZoneMetadata from '../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { ReactComponent as LayersSVG } from '../icons/Couches.svg'
import AdministrativeLayers from './administrative/AdministrativeLayers'
import BaseLayers from './base/BaseLayers'
import RegulatoryLayers from './regulatory/RegulatoryLayers'
import RegulatoryZoneMetadata from './regulatory/RegulatoryZoneMetadata'
import RegulatoryLayerSearch from './regulatory/search/RegulatoryLayerSearch'

function LayersSidebar() {
  const dispatch = useDispatch()
  const { regulatoryZoneMetadataPanelIsOpen } = useSelector(state => state.regulatory)
  const { healthcheckTextWarning, leftBoxOpened, previewFilteredVesselsMode } = useSelector(state => state.global)

  const [numberOfRegulatoryLayersSaved, setNumberOfRegulatoryLayersSaved] = useState(0)
  const [hideLayersListWhenSearching, setHideLayersListWhenSearching] = useState(false)

  useEffect(() => {
    if (leftBoxOpened !== LeftBoxOpened.REGULATIONS) {
      dispatch(closeRegulatoryZoneMetadata())
    }
  }, [leftBoxOpened])

  return (
    <NamespaceContext.Consumer>
      {namespace => (
        <>
          <SidebarLayersIcon
            data-cy="layers-sidebar"
            healthcheckTextWarning={healthcheckTextWarning}
            isHidden={previewFilteredVesselsMode}
            isVisible={leftBoxOpened === LeftBoxOpened.REGULATIONS || regulatoryZoneMetadataPanelIsOpen}
            onClick={() =>
              dispatch(setLeftBoxOpened(leftBoxOpened === LeftBoxOpened.REGULATIONS ? null : LeftBoxOpened.REGULATIONS))
            }
            regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
            title="Couches réglementaires"
          >
            <LayersIcon />
          </SidebarLayersIcon>
          <Sidebar
            data-cy="layers-sidebar-box"
            healthcheckTextWarning={healthcheckTextWarning}
            isVisible={leftBoxOpened === LeftBoxOpened.REGULATIONS || regulatoryZoneMetadataPanelIsOpen}
            layersSidebarIsOpen={leftBoxOpened === LeftBoxOpened.REGULATIONS}
          >
            <RegulatoryLayerSearch
              layersSidebarIsOpen={leftBoxOpened === LeftBoxOpened.REGULATIONS}
              namespace={namespace}
              numberOfRegulatoryLayersSaved={numberOfRegulatoryLayersSaved}
              setHideLayersListWhenSearching={setHideLayersListWhenSearching}
              setNumberOfRegulatoryLayersSaved={setNumberOfRegulatoryLayersSaved}
            />
            <Layers healthcheckTextWarning={healthcheckTextWarning}>
              <RegulatoryLayers
                hideLayersListWhenSearching={hideLayersListWhenSearching}
                namespace={namespace}
                regulatoryLayersAddedToMySelection={numberOfRegulatoryLayersSaved}
              />
              <AdministrativeLayers hideLayersListWhenSearching={hideLayersListWhenSearching} namespace={namespace} />
              <BaseLayers namespace={namespace} />
            </Layers>
            <RegulatoryZoneMetadataShifter
              leftBoxOpened={leftBoxOpened}
              regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}
            >
              <RegulatoryZoneMetadata />
            </RegulatoryZoneMetadataShifter>
          </Sidebar>
        </>
      )}
    </NamespaceContext.Consumer>
  )
}

const RegulatoryZoneMetadataShifter = styled.div`
  position: absolute;
  margin-left: ${props => (props.regulatoryZoneMetadataPanelIsOpen ? (props.leftBoxOpened ? 355 : 373) : -455)}px;
  margin-top: 45px;
  top: 0px;
  opacity: ${props => (props.regulatoryZoneMetadataPanelIsOpen ? 1 : 0)};
  background: linear-gradient(${p => p.theme.color.gainsboro} 70%, rgb(0, 0, 0, 0));
  z-index: -1;
  transition: all 0.5s;
`

const Sidebar = styled(MapComponentStyle)`
  margin-left: ${props => (props.layersSidebarIsOpen ? 0 : '-418px')};
  opacity: ${props => (props.isVisible ? 1 : 0)};
  top: 10px;
  left: 57px;
  z-index: 999;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: 0.5s all;
`

const Layers = styled.div`
  margin-top: 5px;
  width: 350px;
  max-height: calc(100vh - ${props => (props.healthcheckTextWarning ? '210px' : '160px')});
`

const SidebarLayersIcon = styled(MapButtonStyle)`
  position: absolute;
  display: inline-block;
  background: ${props => (props.isVisible ? props.theme.color.blueGray[100] : props.theme.color.charcoal)};
  padding: 2px 2px 2px 2px;
  top: 10px;
  left: 12px;
  border-radius: 2px;
  height: 40px;
  width: 40px;

  :hover,
  :focus {
    background: ${props => (props.isVisible ? props.theme.color.blueGray[100] : props.theme.color.charcoal)};
  }
`

const LayersIcon = styled(LayersSVG)`
  width: 35px;
  height: 35px;
`

export default LayersSidebar
