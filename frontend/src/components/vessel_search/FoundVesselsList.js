import { getVesselIdentityFromFeature, getVesselIdentityFromVessel } from '../../domain/entities/vessel'
import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import focusOnVesselSearch, { focusState } from '../../domain/use_cases/focusOnVesselSearch'
import countries from 'i18n-iso-countries'
import Highlighter from 'react-highlight-words'
import { useDispatch } from 'react-redux'

const FoundVesselsList = ({ searchText, foundVesselsOnMap, foundVesselsFromAPI, setVesselsHasBeenUpdated, setSelectedVesselIdentity, setSearchText }) => {
  const dispatch = useDispatch()

  function getListItem (id, flagState, internalReferenceNumber, externalReferenceNumber, ircs, mmsi, vesselName, vessel) {
    return (
      <ListItem
        onClick={() => {
          dispatch(focusOnVesselSearch(focusState.CLICK_VESSEL_SEARCH_RESULT))
          setVesselsHasBeenUpdated(false)
          setSelectedVesselIdentity(vessel)
          setSearchText('')
        }}
        key={id}>
        <div>
          {flagState
            ? <Flag rel="preload"
                    title={countries.getName(flagState, 'fr')}
                    src={`flags/${flagState.toLowerCase()}.svg`}/>
            : null}
          <Name>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[searchText]}
              autoEscape={true}
              textToHighlight={vesselName || 'SANS NOM'}
            />
          </Name>
        </div>
        <Information>
          <CFR>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[searchText]}
              autoEscape={true}
              textToHighlight={internalReferenceNumber || ''}
            />
            {internalReferenceNumber ? null : <Light>Inconnu</Light>}
            {' '}<Light>(CFR)</Light>
          </CFR>
          <ExtNum>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[searchText]}
              autoEscape={true}
              textToHighlight={externalReferenceNumber || ''}
            />
            {externalReferenceNumber ? null : <Light>Inconnu</Light>}
            {' '}<Light>(Marq. Ext.)</Light>
          </ExtNum>
        </Information>
        <Information>
          <MMSI>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[searchText]}
              autoEscape={true}
              textToHighlight={mmsi || ''}
            />
            {mmsi ? null : <Light>Inconnu</Light>}
            {' '}<Light>(MMSI)</Light>
          </MMSI>
          <CallSign>
            <Highlighter
              highlightClassName="highlight"
              searchWords={[searchText]}
              autoEscape={true}
              textToHighlight={ircs || ''}
            />
            {ircs ? null : <Light>Inconnu</Light>}
            {' '}<Light>(Call Sign)</Light>
          </CallSign>
        </Information>
      </ListItem>
    )
  }

  return <>
    {
      (foundVesselsOnMap && foundVesselsOnMap.length) || (foundVesselsFromAPI && foundVesselsFromAPI.length)
        ? <Results>
          <List>
            {
              foundVesselsOnMap.map(feature => {
                const vessel = getVesselIdentityFromFeature(feature)

                return getListItem(
                  feature.id_,
                  vessel.flagState,
                  vessel.internalReferenceNumber,
                  vessel.externalReferenceNumber,
                  vessel.ircs,
                  vessel.mmsi,
                  vessel.vesselName,
                  vessel)
              })
            }
            {
              foundVesselsFromAPI.map((vessel, index) => {
                const vesselIdentity = getVesselIdentityFromVessel(vessel)

                return getListItem(
                  index,
                  vesselIdentity.flagState,
                  vesselIdentity.internalReferenceNumber,
                  vesselIdentity.externalReferenceNumber,
                  vesselIdentity.ircs,
                  vesselIdentity.mmsi,
                  vesselIdentity.vesselName,
                  vesselIdentity)
              })
            }
          </List>
        </Results>
        : ''
    }
    </>
}

export default FoundVesselsList

const Results = styled.div`
  background: white;
  color: ${COLORS.grayDarkerThree};
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`

const ListItem = styled.li`
  padding: 0 5px 5px 7px;
  font-size: 13px;
  text-align: left;
  list-style-type: none;
  cursor: pointer;
  border-bottom: ${COLORS.grayDarker} 1px solid;
  
  :hover {
    background: ${COLORS.grayBackground};
  }
`

const List = styled.ul`
  margin: 0;
  padding: 0;
  border-radius: 2px;
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 311px;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`

const Light = styled.span`
  font-weight: 300; 
`

const Name = styled.span`
  display: inline-block;
  margin-top: 10px;
  margin-left: 10px;
  font-weight: 400;
  font-size: 13px;
`

const Information = styled.div`
  display: flex;
  font-size: 13px;
  margin-left: 5px;
  color: ${COLORS.textGray};
`

const CallSign = styled.div`
  font-size: 13px;
  flex: 2;
  min-width: 130px;
`

const MMSI = styled.div`
  font-size: 13px;
  flex: 1;
  min-width: 140px;
`

const ExtNum = styled.div`
  font-size: 13px;
  flex: 2;
  min-width: 130px;
`

const CFR = styled.div`
  font-size: 13px;
  flex: 1;
  min-width: 140px;
`

const Flag = styled.img`
  font-size: 25px;
  margin-left: 5px;
  display: inline-block;
  width: 1em;                      
  height: 1em;                      
  vertical-align: middle;
`
