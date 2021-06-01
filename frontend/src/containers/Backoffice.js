import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BaseMap from './BaseMap'
import styled from 'styled-components'
import getAllRegulatoryZonesByRegTerritory from '../domain/use_cases/getAllRegulatoryZonesByRegTerritory'
import { setError } from '../domain/reducers/Global'
import { ReactComponent as SearchIconSVG } from '../components/icons/Loupe.svg'
import RegulatoryZoneSelectedLayer from '../components/regulatory_zones/RegulatoryZoneSelectedLayer'
//import showRegulatoryZoneMetadata from '../domain/use_cases/showRegulatoryZoneMetadata'
//import closeRegulatoryZoneMetadata from '../domain/use_cases/closeRegulatoryZoneMetadata'
//import zoomInSubZone from '../domain/use_cases/zoomInSubZone'
import { COLORS } from '../constants/constants'

// actions to regulatory zones
import showLayer from '../domain/use_cases/showLayer'
import hideLayers from '../domain/use_cases/hideLayers'
import LayersEnum from '../domain/entities/layers'

const Backoffice = () => {
  const [searchText, setSearchText] = useState('')
  const [regulatoryZoneListByRegTerritory, setRegulatoryZoneListByRegTerritory] = useState(undefined)
  const dispatch = useDispatch()

  /*const {
    regulatoryZoneMetadata
  } = useSelector(state => state.regulatory)*/

  //const showedLayers = useSelector(state => state.layer.showedLayers)

  const [numberOfZonesOpened, setNumberOfZonesOpened] = useState(0)

  const searchRegulatoryZone = () => {
    console.log(`Search text is ${searchText}`)
  }

  const getRegulatoryZones = () => {
    dispatch(getAllRegulatoryZonesByRegTerritory(dispatch))
      .then(regulatoryZones => {
        setRegulatoryZoneListByRegTerritory(regulatoryZones)
      })
      .catch(error => {
        dispatch(setError(error))
      })
  }
  useEffect(() => {
    console.log('useEffect')
    getRegulatoryZones()
  }, [])

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

  const displayRegulatoryZoneListByLawType = (regZoneByLawType) => {
    return (
      regZoneByLawType && Object.keys(regZoneByLawType).length > 0
        ? Object.keys(regZoneByLawType).map(lawType => {
          return <>
            <LawTypeName>{lawType}</LawTypeName>
            <RegulatoryZoneLayerList key={lawType}>
              {displayRegulatoryZoneList(regZoneByLawType[lawType])}
            </RegulatoryZoneLayerList>
          </>
        })
        : <div>Aucune Law Type disponible</div>)
  }

  const displayRegulatoryZoneByRegTerritory = (territory) => {
    const franceRegList = regulatoryZoneListByRegTerritory[territory]
    return franceRegList
      ? <RegulatoryZoneListByLawTypeList>{displayRegulatoryZoneListByLawType(franceRegList)} </RegulatoryZoneListByLawTypeList>
      : <div>Aucune zone pour ce territoire</div>
  }

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

  return (
    <BackofficeContainer>
      <RegularotyZonePanel >
        <SearchContainer>
          <SearchBoxInput
            ref={input => input && input.focus()}
            type="text"
            value={searchText}
            placeholder={''}
            onChange={e => setSearchText(e.target.value)}/>
          <SearchButton
            onClick={() => searchRegulatoryZone()}
          >
            <SearchIcon />
          </SearchButton>
        </SearchContainer>
        <ButtonList>
          <Button>brouillon (X)</Button>
          <Button>tracé en attente (X)</Button>
        </ButtonList>
        {regulatoryZoneListByRegTerritory
          ? <SearchResultList>
            <Territory>
              <TerritoryName>{'Réglementation France'}</TerritoryName>
              {displayRegulatoryZoneByRegTerritory('France')}
            </Territory>
            <Territory>
              <TerritoryName>{'Réglementation UE'}</TerritoryName>
              {displayRegulatoryZoneByRegTerritory('UE')}
            </Territory>
          </SearchResultList>
          : <div>En attente de chargement</div>}
        <ButtonList>
          <Button>Saisir une nouvelle réglementation</Button>
          <Button>Modifier une règlementation</Button>
        </ButtonList>
      </RegularotyZonePanel>
      <BaseMap />
    </BackofficeContainer>
  )
}

const SearchResultList = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 5px;
  color: ${COLORS.textWhite};
  text-decoration: none;
  background-color: ${COLORS.gray};
  max-height: 400px;
  border-radius: 2px;
`

const Territory = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 5px;
  max-width: 50%;
`

const TerritoryName = styled.div`
  display: flex;
  font-size: 13px;
  text-transform: uppercase;
  color: ${COLORS.grayDarkerThree};
  color: ${COLORS.textGray};
  font-size: 16px;
`

const RegulatoryZoneListByLawTypeList = styled.div`
  margin: 10px 5px;
`

const LawTypeName = styled.div`
  font-size: 16px;
  color: ${COLORS.grayDarkerThree};
  border-bottom: 2px solid ${COLORS.squareBorder};
  text-align: left;
  text-transform: uppercase;
`

const RegulatoryZoneLayerList = styled.ul`
  margin: 0;
  background-color: ${COLORS.background};
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  max-height: 550px;
  overflow-x: hidden;
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

const SearchContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  justify-content: center;
  padding: 10px;
`

const ButtonList = styled.div`
  display: flex;
  flex-direction:row;
`

const Button = styled.div`
  border: 2px solid black;
`

const BackofficeContainer = styled.div`
  display: flex;
`

const RegularotyZonePanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  max-width: 50%;
`

const SearchBoxInput = styled.input`
  margin: 0;
  background-color: white;
  border: 1px ${COLORS.gray} solid;
  border-radius: 0;
  color: ${COLORS.grayDarkerThree};
  font-size: 0.8em;
  height: 40px;
  width: 100%;
  padding: 0 5px 0 10px;
`

const SearchIcon = styled(SearchIconSVG)`
  width: 40px;
  height: 40px;
  float: right;
  background: ${COLORS.grayDarkerThree};
  cursor: pointer;
`

const SearchButton = styled.a`
  width: 40px;
  height: 40px;
`

export default Backoffice
