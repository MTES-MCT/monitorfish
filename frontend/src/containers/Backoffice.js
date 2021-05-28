import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import BaseMap from './BaseMap'
import styled from 'styled-components'
import getAllRegulatoryZonesByLawType from '../domain/use_cases/getAllRegulatoryZonesByLawType'
import { setError } from '../domain/reducers/Global'
import { ReactComponent as SearchIconSVG } from '../components/icons/Loupe.svg'
import { COLORS } from '../constants/constants'

const Backoffice = () => {
  const [searchText, setSearchText] = useState('')
  const [regulatoryZoneListByLawType, setRegulatoryZoneListByLawType] = useState(undefined)
  const dispatch = useDispatch()

  const searchRegulatoryZone = () => {
    console.log(`Search text is ${searchText}`)
    dispatch(getAllRegulatoryZonesByLawType(dispatch))
      .then(regulatoryZones => setRegulatoryZoneListByLawType(regulatoryZones))
      .catch(error => {
        dispatch(setError(error))
      })
  }

  const lawTypeList = {
    'Reg locale': 'France',
    'Reg 494 - Merlu': 'UE',
    'R(UE) 2019/1241': 'UE',
    'R(UE) 1380/2013': 'UE'
  }

  const getRegulatoryZones = () => {
    dispatch(getAllRegulatoryZonesByLawType(dispatch))
      .then(regulatoryZones => {
        setRegulatoryZoneListByLawType(regulatoryZones)
      })
      .catch(error => {
        dispatch(setError(error))
      })
  }
  useEffect(() => {
    console.log('useEffect')
    getRegulatoryZones()
  }, [])

  const displayRegulatoryZoneListByLayerName = (regulatoryZoneLayerName) => {
    return (<RegulatoryZoneList color="red" isRegZone>
      {
        regulatoryZoneListByLawType[regulatoryZoneLayerName].map((regulatoryZone, i) => {
          console.log(regulatoryZone)
          return <RegulatoryZoneLayerName key={i} >{regulatoryZone.zone}</RegulatoryZoneLayerName>
        })
      }</RegulatoryZoneList>)
  }

  const displayRegulatoryZoneList = (regulatoryZoneList) => {
    return (<RegulatoryZoneList >
      {
        regulatoryZoneList && Object.keys(regulatoryZoneList).length > 0
          ? Object.keys(regulatoryZoneList).map((regulatoryZoneLayerName) => {
            return <RegulatoryZoneLayerName key={regulatoryZoneLayerName}>
              <RegZoneName>{regulatoryZoneLayerName}</RegZoneName>
              {displayRegulatoryZoneListByLayerName(regulatoryZoneList[regulatoryZoneLayerName])}
            </RegulatoryZoneLayerName>
          })
          : <div>Aucune zone disponible</div>
      }
      </RegulatoryZoneList>
    )
  }

  const displayRegulatoryZoneListByLawType = () => {
    return (<RegulatoryZoneList >{
      regulatoryZoneListByLawType && Object.keys(regulatoryZoneListByLawType).length > 0
        ? Object.keys(regulatoryZoneListByLawType).map(lawType => {
          console.log(lawType)
          return <RegulatoryZoneLayerName key={lawType}>
            <LawTypeName>{lawType}</LawTypeName>
            {displayRegulatoryZoneList(regulatoryZoneListByLawType[lawType])}
          </RegulatoryZoneLayerName>
        })
        : <div>Aucune Law Type disponible</div>
      }

    </RegulatoryZoneList>)
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
        <SearchResultList>
          {regulatoryZoneListByLawType !== undefined
            ? displayRegulatoryZoneListByLawType()
            : <div>En attente</div>
          }
        </SearchResultList>
        <ButtonList>
          <Button>Saisir une nouvelle réglementation</Button>
          <Button>Modifier une règlementation</Button>
        </ButtonList>
      </RegularotyZonePanel>
      <BaseMap />
    </BackofficeContainer>
  )
}

const RegZoneName = styled.div`
  font-size: 13px;
  color: blue;
`

const LawTypeName = styled.div`
  font-size: 15px;
  color: green;
`

const RegulatoryZoneList = styled.ul`
  margin: 0;
  background-color: ${props => props.color ? props.color : COLORS.background};
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
const RegulatoryZoneLayerName = styled.li`
  font-size: 0.8em;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  cursor: pointer;
  border-bottom: rgba(255, 255, 255, 0.2) 1px solid;
  line-height: 1.9em;
  display: block;
`

const SearchResultList = styled.div`
  display: flex;
  flex-direction: column;
  height: 400px;
  border: 2px solid black;
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
  flex-direction: column;
  flex: 1;
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
