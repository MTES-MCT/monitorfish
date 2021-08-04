import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import AdministrativeLayer from './AdministrativeLayer'
import { COLORS } from '../../../constants/constants'
import AdministrativeLayerGroup from './AdministrativeLayerGroup'
import getAdministrativeZonesAndSubZones from '../../../domain/use_cases/getAdministrativeZonesAndSubZones'
import hideLayer from '../../../domain/use_cases/hideLayer'
import NamespaceContext from '../../../domain/context/NamespaceContext'
import layer from '../../../domain/shared_slices/Layer'
import LayersEnum, { layersType } from '../../../domain/entities/layers'
import { ChevronIcon } from '../../commonStyles/icons/ChevronIcon.style'
import showAdministrativeLayer from '../../../domain/use_cases/showAdministrativeLayer'

const AdministrativeLayers = props => {
  const {
    hideLayersListWhenSearching,
    namespace
  } = props

  const {
    setLayersSideBarOpenedZone
  } = layer[namespace].actions

  const dispatch = useDispatch()
  const showedLayers = useSelector(state => state.layer.showedLayers)
  const { layersSidebarOpenedLayer } = useSelector(state => state.layer)

  const [showZones, setShowZones] = useState(false)
  const [zones, setZones] = useState([])

  useEffect(() => {
    const administrativeLayers = Object.keys(LayersEnum)
      .map(layer => LayersEnum[layer])
      .filter(layer => layer.type === layersType.ADMINISTRATIVE)

    if (administrativeLayers && administrativeLayers.length) {
      dispatch(getAdministrativeZonesAndSubZones(administrativeLayers))
        .then(nextZones => {
          setZones(nextZones)
        })
    }
  }, [])

  useEffect(() => {
    setShowZones(layersSidebarOpenedLayer === layersType.ADMINISTRATIVE)
  }, [layersSidebarOpenedLayer, setShowZones])

  useEffect(() => {
    if (hideLayersListWhenSearching) {
      setShowZones(false)
    }
  }, [hideLayersListWhenSearching])

  const callShowAdministrativeZone = namespace => (administrativeZone, administrativeSubZone) => {
    dispatch(showAdministrativeLayer({
      type: administrativeZone,
      zone: administrativeSubZone,
      namespace
    }))
  }

  const callHideAdministrativeZone = namespace => (administrativeZone, administrativeSubZone) => {
    dispatch(hideLayer({
      type: administrativeZone,
      ...administrativeSubZone,
      namespace
    }))
  }

  const onSectionTitleClicked = () => {
    if (showZones) {
      dispatch(setLayersSideBarOpenedZone(''))
    } else {
      dispatch(setLayersSideBarOpenedZone(layersType.ADMINISTRATIVE))
    }
  }

  return (
    <>
      <SectionTitle onClick={onSectionTitleClicked} showZones={showZones}>
        Zones administratives <ChevronIcon isOpen={showZones}/>
      </SectionTitle>
      <NamespaceContext.Consumer>
        {namespace => (
          zones && zones.length
            ? <ZonesList showZones={showZones} zonesLength={zones.length}>
              {
                zones.map((layers, index) => {
                  if (layers.length === 1 && layers[0]) {
                    return <ListItem key={layers[0].code}>
                      <AdministrativeLayer
                        key={layers[0].code}
                        isShownOnInit={showedLayers.some(layer_ => layer_.type === layers[0].code)}
                        layer={layers[0]}
                        callShowAdministrativeZone={callShowAdministrativeZone(namespace)}
                        callHideAdministrativeZone={callHideAdministrativeZone(namespace)}
                      />
                    </ListItem>
                  } else {
                    return <ListItem key={layers[0].group.code}>
                      <AdministrativeLayerGroup
                        isLastItem={zones.length === index + 1}
                        layers={layers}
                        showedLayers={showedLayers}
                        callShowAdministrativeZone={callShowAdministrativeZone(namespace)}
                        callHideAdministrativeZone={callHideAdministrativeZone(namespace)}
                      />
                    </ListItem>
                  }
                })
              }
            </ZonesList>
            : null
        )
        }
      </NamespaceContext.Consumer>
    </>
  )
}

const SectionTitle = styled.div`
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
  border-bottom-left-radius: ${props => props.showZones ? '0' : '2px'};
  border-bottom-right-radius: ${props => props.showZones ? '0' : '2px'};
`

const ZonesList = styled.ul`
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  max-height: 70vh;
  height: ${props => props.showZones && props.zonesLength ? 37 * props.zonesLength : 0}px;
  background: ${COLORS.background};
  transition: 0.5s all;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`

const ListItem = styled.li`
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

export default AdministrativeLayers
