import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import RegulatoryZoneSelectedLayer from '../regulatory_zones/RegulatoryZoneSelectedLayer'
import showLayer from '../../domain/use_cases/showLayer'
import hideLayers from '../../domain/use_cases/hideLayers'
import showRegulatoryZoneMetadata from '../../domain/use_cases/showRegulatoryZoneMetadata'
import LayersEnum from '../../domain/entities/layers'
import { COLORS } from '../../constants/constants'
import zoomInSubZone from '../../domain/use_cases/zoomInSubZone'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'

const LawType = props => {
  const [numberOfZonesOpened, setNumberOfZonesOpened] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dispatch = useDispatch()

  const {
    lawType,
    regZoneByLawType,
    showedLayers,
    gears,
    isReadyToShowRegulatoryZones,
    callCloseRegulatoryZoneMetadata
  } = props

  function increaseNumberOfZonesOpened (number) {
    setNumberOfZonesOpened(numberOfZonesOpened + number)
  }

  function decreaseNumberOfZonesOpened (number) {
    const value = numberOfZonesOpened - number
    if (value < 0) {
      setNumberOfZonesOpened(0)
    } else {
      setNumberOfZonesOpened(value)
    }
  }

  function callShowRegulatorySubZoneMetadata (regulatorySubZone) {
    dispatch(showRegulatoryZoneMetadata(regulatorySubZone))
  }

  function callZoomInSubZone (subZone) {
    dispatch(zoomInSubZone(subZone))
  }

  function callShowRegulatoryZone (regulatoryZone) {
    dispatch(showLayer({
      type: LayersEnum.REGULATORY.code,
      zone: regulatoryZone
    }))
  }

  function callHideRegulatoryZone (regulatoryZone) {
    dispatch(hideLayers({
      type: LayersEnum.REGULATORY.code,
      zone: regulatoryZone
    }))
  }

  const displayRegulatoryZoneList = (regulatoryZoneList) => {
    return (<>
      {
        regulatoryZoneList && Object.keys(regulatoryZoneList).length > 0
          ? Object.keys(regulatoryZoneList).map((regulatoryZoneLayerName, index) => {
            return <RegulatoryZoneSelectedLayer
              key={regulatoryZoneLayerName}
              callShowRegulatoryZone={callShowRegulatoryZone}
              callHideRegulatoryZone={callHideRegulatoryZone}
              callShowRegulatorySubZoneMetadata={callShowRegulatorySubZoneMetadata}
              callCloseRegulatoryZoneMetadata={callCloseRegulatoryZoneMetadata}
              callZoomInSubZone={callZoomInSubZone}
              showedLayers={showedLayers}
              regulatoryZoneName={regulatoryZoneLayerName}
              increaseNumberOfZonesOpened={increaseNumberOfZonesOpened}
              decreaseNumberOfZonesOpened={decreaseNumberOfZonesOpened}
              regulatorySubZones={regulatoryZoneList[regulatoryZoneLayerName]}
              isLastItem={Object.keys(regulatoryZoneList).length === index + 1}
              regulatoryZoneMetadata={undefined}
              gears={gears}
              isReadyToShowRegulatoryZones={isReadyToShowRegulatoryZones}
              allowRemoveZone={false}
            />
          })
          : <div>Aucune zone disponible</div>
        }
      </>
    )
  }

  return (<>
    <LawTypeName onClick={() => setIsOpen(!isOpen)}>
      {lawType}
      <ChevronIcon isopen={isOpen}/>
    </LawTypeName>
    {isOpen && <RegulatoryZoneLayerList isOpen={isOpen}>
      {displayRegulatoryZoneList(regZoneByLawType[lawType])}
    </RegulatoryZoneLayerList>}
  </>)
}

const LawTypeName = styled.div`
  font-size: 16px;
  color: ${COLORS.grayDarkerThree};
  border-bottom: 2px solid ${COLORS.squareBorder};
  text-align: left;
  text-transform: uppercase;
  cursor: pointer;
`

const RegulatoryZoneLayerList = styled.ul`
  margin: 0;
  background-color: ${COLORS.background};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  color: ${COLORS.grayDarkerThree};

  animation: ${props => props.isOpen ? 'regulatory-selected-opening' : 'regulatory-selected-closing'} 0.5s ease forwards;

  @keyframes regulatory-selected-opening {
    0%   {
        height: 0;
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
  }

  @keyframes regulatory-selected-closing {
    0%   {
        opacity: 1;
    }
    100% {
        opacity: 0;
        height: 0;
    }
  }
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 17px;
  float: right;
  margin-right: 10px;
  margin-top: 5px;

  animation: ${props => props.isopen ? 'chevron-layer-opening' : 'chevron-layer-closing'} 0.5s ease forwards;

  @keyframes chevron-layer-opening {
    0%   { transform: rotate(180deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes chevron-layer-closing {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(180deg);   }
  }
`

export default LawType
