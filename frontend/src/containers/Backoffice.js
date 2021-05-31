import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import BaseMap from './BaseMap'
import styled from 'styled-components'
import getAllRegulatoryZonesByRegTerritory from '../domain/use_cases/getAllRegulatoryZonesByRegTerritory'
import { setError } from '../domain/reducers/Global'
import { ReactComponent as SearchIconSVG } from '../components/icons/Loupe.svg'
import RegulatoryZoneSelectedLayer from '../components/regulatory_zones/RegulatoryZoneSelectedLayer'
import { COLORS } from '../constants/constants'

import { Style } from 'ol/style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'

const Backoffice = () => {
  const [searchText, setSearchText] = useState('')
  const [regulatoryZoneListByRegTerritory, setRegulatoryZoneListByRegTerritory] = useState(undefined)
  const dispatch = useDispatch()

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

  const displayRegulatoryZoneList = (regulatoryZoneList) => {
    return (<RegulatoryZoneList >
      {
        regulatoryZoneList && Object.keys(regulatoryZoneList).length > 0
          ? Object.keys(regulatoryZoneList).map((regulatoryZoneLayerName, index) => {
            return <RegulatoryZoneSelectedLayer
              key={regulatoryZoneLayerName}
              callRemoveRegulatoryZoneFromMySelection={() => console.log('callRemoveRegulatoryZoneFromMySelection')}
              callShowRegulatoryZone={() => console.log('callShowRegulatoryZone')}
              callHideRegulatoryZone={() => console.log('callHideRegulatoryZone')}
              callShowRegulatorySubZoneMetadata={() => console.log('callShowRegulatorySubZoneMetadata')}
              callCloseRegulatoryZoneMetadata={() => console.log('callCloseRegulatoryZoneMetadata')}
              callZoomInSubZone={() => console.log('callZoomInSubZone')}
              showedLayers={false}
              regulatoryZoneName={regulatoryZoneLayerName}
              allowRemoveZone={false}
              increaseNumberOfZonesOpened={false}
              decreaseNumberOfZonesOpened={() => console.log('decreaseNumberOfZonesOpened')}
              regulatorySubZones={regulatoryZoneList[regulatoryZoneLayerName]}
              regulatoryZoneMetadata={undefined}
              isLastItem={Object.keys(regulatoryZoneList).length === index + 1}
              gears={undefined}
              isReadyToShowRegulatoryZones={false}
            />
          })
          : <div>Aucune zone disponible</div>
      }
      </RegulatoryZoneList>
    )
  }

  const displayRegulatoryZoneListByLawType = (regZoneByLawType) => {
    return (<RegulatoryZoneList >{
      regZoneByLawType && Object.keys(regZoneByLawType).length > 0
        ? Object.keys(regZoneByLawType).map(lawType => {
          return <RegulatoryZoneLayerName key={lawType}>
            <LawTypeName>{lawType}</LawTypeName>
            {displayRegulatoryZoneList(regZoneByLawType[lawType])}
          </RegulatoryZoneLayerName>
        })
        : <div>Aucune Law Type disponible</div>
      }

    </RegulatoryZoneList>)
  }

  const displayRegulatoryZoneByRegTerritory = (territory) => {
    const franceRegList = regulatoryZoneListByRegTerritory[territory]
    console.log(territory)
    console.log(franceRegList)
    return franceRegList
      ? displayRegulatoryZoneListByLawType(franceRegList)
      : <div>En attente</div>
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
  height: 400px;
  flex-direction: row;
`

const Territory = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`

const TerritoryName = styled.div`
  display: flex;
  font-size: 13px;
  text-transform: uppercase;
  color: ${COLORS.grayDarkerThree};
`

const LawTypeName = styled.div`
  font-size: 15px;
  color: green;
`

const RegulatoryZoneNameList = styled.div`
  display: flex;
  flex-direction: column;
  height: inherit;
  overflow: hidden;
  color: ${COLORS.grayDarkerThree};
`

const RegulatoryZoneList = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0;
  border-radius: 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  padding: 0;
  max-height: ${props => props.isRegZone ? 'unset' : '550px'};
  overflow-x: ${props => props.isRegZone ? 'unset' : 'hidden'};
  color: ${COLORS.grayDarkerThree};
  
  /*animation: ${props => props.showRegulatoryZonesSelected ? 'regulatory-selected-opening' : 'regulatory-selected-closing'} 0.5s ease forwards;*/

  /*@keyframes regulatory-selected-opening {
    0%   {
        height: 0;
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
  }*/

  /*@keyframes regulatory-selected-closing {
    0%   {
        opacity: 1;
    }
    100% {
        opacity: 0;
        height: 0;
    }
  }*/
`
const RegulatoryZoneLayerName = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 0.8em;
  text-align: left;
  list-style-type: none;
  white-space: nowrap;
  cursor: pointer;
  border-bottom: rgba(255, 255, 255, 0.2) 1px solid;
  line-height: 1.9em;
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
  max-width: 100%
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
