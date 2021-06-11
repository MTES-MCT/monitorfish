import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import RegulatoryZoneSelectedLayer from '../regulatory_zones/RegulatoryZoneSelectedLayer'
// actions to regulatory zones
import showLayer from '../../domain/use_cases/showLayer'
import hideLayers from '../../domain/use_cases/hideLayers'
import LayersEnum from '../../domain/entities/layers'
import { COLORS } from '../../constants/constants'

const LawType = ({ lawType, regZoneByLawType }) => {
  const [numberOfZonesOpened, setNumberOfZonesOpened] = useState(0)
  // const showedLayers = useSelector(state => state.layer.showedLayers)
  const dispatch = useDispatch()

  const {
    isReadyToShowRegulatoryZones,
    //regulatoryZoneMetadataPanelIsOpen,
    //loadingRegulatoryZoneMetadata,
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)

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
    console.log('callShowRegulatorySubZoneMetadata')
    // dispatch(showRegulatoryZoneMetadata(regulatorySubZone))
  }

  function callCloseRegulatoryZoneMetadata () {
    console.log('callCloseRegulatoryZoneMetadata')
    //dispatch(closeRegulatoryZoneMetadata())
  }

  function callZoomInSubZone (subZone) {
    console.log('callZoomInSubZone')
    //dispatch(zoomInSubZone(subZone))
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
              showedLayers={[]}
              regulatoryZoneName={regulatoryZoneLayerName}
              increaseNumberOfZonesOpened={increaseNumberOfZonesOpened}
              decreaseNumberOfZonesOpened={decreaseNumberOfZonesOpened}
              regulatorySubZones={regulatoryZoneList[regulatoryZoneLayerName]}
              isLastItem={Object.keys(regulatoryZoneList).length === index + 1}
              regulatoryZoneMetadata={undefined}
              gears={undefined}
              isReadyToShowRegulatoryZones={true}
              allowRemoveZone={false}
            />
          })
          : <div>Aucune zone disponible</div>
        }
      </>
    )
  }

  const [isOpen, setIsOpen] = useState(false)
  return (<>
    <LawTypeName onClick={() => setIsOpen(!isOpen)}>{lawType}</LawTypeName>
    {isOpen && <RegulatoryZoneLayerList>
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
`

// Ce style existe sûrement ailleurs
const RegulatoryZoneLayerList = styled.ul`
  margin: 0;
  background-color: ${COLORS.background};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  color: ${COLORS.grayDarkerThree};

  animation: ${props => props.showRegulatoryZonesSelected ? 'regulatory-selected-opening' : 'regulatory-selected-closing'} 0.5s ease forwards;

  /*@keyframes regulatory-selected-opening {
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
  }*/
`

export default LawType
