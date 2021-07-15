import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'

import AdministrativeZone from './AdministrativeZone'
import { COLORS } from '../../constants/constants'
import AdministrativeZoneGroup from './AdministrativeZoneGroup'
import getAdministrativeZonesAndSubZones from '../../domain/use_cases/getAdministrativeZonesAndSubZones'
import showLayer from '../../domain/use_cases/showLayer'
import hideLayers from '../../domain/use_cases/hideLayers'
import NamespaceContext from '../../domain/context/NamespaceContext'
import layer from '../../domain/reducers/Layer'
import { layersType } from '../../domain/entities/layers'

const AdministrativeZones = ({ administrativeZones, hideZonesListWhenSearching, namespace }) => {
  const {
    setLayersSideBarOpenedZone
  } = layer[namespace].actions

  const dispatch = useDispatch()
  const showedLayers = useSelector(state => state.layer.showedLayers)

  const [showZones, setShowZones] = useState(false)
  const [zones, setZones] = useState([])
  const firstUpdate = useRef(true)

  const { layersSidebarOpenedZone } = useSelector(state => state.layer)

  useEffect(() => {
    setShowZones(layersSidebarOpenedZone === layersType.ADMINISTRATIVE)
  }, [layersSidebarOpenedZone, setShowZones])

  useEffect(() => {
    if (firstUpdate) {
      firstUpdate.current = false
    } else {
      if (hideZonesListWhenSearching) {
        setShowZones(false)
      } else {
        setShowZones(true)
      }
    }
  }, [hideZonesListWhenSearching])

  useEffect(() => {
    if (administrativeZones && administrativeZones.length) {
      dispatch(getAdministrativeZonesAndSubZones(administrativeZones))
        .then(nextZones => {
          setZones(nextZones)
        })
    }
  }, [administrativeZones])

  function callShowAdministrativeZone (administrativeZone, administrativeSubZone, namespace) {
    dispatch(showLayer({
      type: administrativeZone,
      zone: administrativeSubZone,
      namespace
    }))
  }

  function callHideAdministrativeZone (administrativeZone, administrativeSubZone, namespace) {
    dispatch(hideLayers({
      type: administrativeZone,
      zone: administrativeSubZone,
      namespace
    }))
  }

  const onSectionTitleClicked = () => {
    if (showZones) {
      setShowZones(false)
      dispatch(setLayersSideBarOpenedZone(''))
    } else {
      setShowZones(true)
      dispatch(setLayersSideBarOpenedZone(layersType.BASE_LAYER))
    }
  }

  return (
    <>
      <SectionTitle onClick={() => onSectionTitleClicked()} showZones={showZones}>
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
                      <AdministrativeZone
                        isShownOnInit={showedLayers.some(layer_ => layer_.type === layers[0].code)}
                        layer={layers[0]}
                        callShowAdministrativeZone={(administrativeZone, administrativeSubZone) => callShowAdministrativeZone(administrativeZone, administrativeSubZone, namespace)}
                        callHideAdministrativeZone={(administrativeZone, administrativeSubZone) => callHideAdministrativeZone(administrativeZone, administrativeSubZone, namespace)}
                      />
                    </ListItem>
                  } else {
                    return <ListItem key={layers[0].group.code}>
                      <AdministrativeZoneGroup
                        isLastItem={zones.length === index + 1}
                        layers={layers}
                        showedLayers={showedLayers}
                        callShowAdministrativeZone={(administrativeZone, administrativeSubZone) => callShowAdministrativeZone(administrativeZone, administrativeSubZone, namespace)}
                        callHideAdministrativeZone={(administrativeZone, administrativeSubZone) => callHideAdministrativeZone(administrativeZone, administrativeSubZone, namespace)}
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
  height: 27px;
  margin-top: 10px;
  padding-top: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  background: ${COLORS.grayDarker};
  color: ${COLORS.grayDarkerTwo};
  font-size: 0.8em;
  padding-top: 10px;
  cursor: pointer;
  font-weight: 500;
  text-align: left;
  padding-left: 15px;
  user-select: none;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  border-bottom-left-radius: ${props => props.showZones ? '0' : '2px'};
  border-bottom-right-radius: ${props => props.showZones ? '0' : '2px'};
`

const ZonesList = styled.ul`
  margin: 0;
  border-radius: 0;
  padding: 0;
  height: 0;
  overflow-x: hidden;
  max-height: 500px;
  
  animation: ${props => props.showZones ? 'admin-zones-opening' : 'admin-zones-closing'} 0.5s ease forwards;

  @keyframes admin-zones-opening {
    0%   { height: 0;   }
    100% { height: ${props => props.zonesLength ? `${38 * props.zonesLength}px` : '175px'}; }
  }

  @keyframes admin-zones-closing {
    0%   { height: ${props => props.zonesLength ? `${38 * props.zonesLength}px` : '175px'}; }
    100% { height: 0;   }
  }
  
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`

const ListItem = styled.li`
  padding: 8px 5px 3px 0px;
  margin: 0;
  font-size: 0.8em;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  cursor: pointer;
  margin: 0;
  background: ${COLORS.background};
  color: ${COLORS.grayDarkerThree};
  border-bottom: 1px solid ${COLORS.gray};
  line-height: 1.9em;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 17px;
  float: right;
  margin-right: 10px;
  margin-top: 5px;
  
  animation: ${props => props.isOpen ? 'chevron-zones-opening' : 'chevron-zones-closing'} 0.5s ease forwards;

  @keyframes chevron-zones-opening {
    0%   { transform: rotate(180deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes chevron-zones-closing {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(180deg);   }
  }
`

export default AdministrativeZones
