import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import countries from 'i18n-iso-countries'
import Highlighter from 'react-highlight-words'

const VesselSearchItem = ({ id, vessel, selectVessel, searchText }) => {
  return <ListItem
    onClick={selectVessel}
    key={id}>
    <div>
      {vessel.flagState
        ? <Flag rel="preload"
                title={countries.getName(vessel.flagState, 'fr')}
                src={`flags/${vessel.flagState.toLowerCase()}.svg`}/>
        : null}
      <Name>
        <Highlighter
          highlightClassName="highlight"
          searchWords={[searchText]}
          autoEscape={true}
          textToHighlight={vessel.vesselName || 'SANS NOM'}
        />
      </Name>
    </div>
    <Information>
      <CFR>
        <Highlighter
          highlightClassName="highlight"
          searchWords={[searchText]}
          autoEscape={true}
          textToHighlight={vessel.internalReferenceNumber || ''}
        />
        {vessel.internalReferenceNumber ? null : <Light>Inconnu</Light>}
        {' '}<Light>(CFR)</Light>
      </CFR>
      <ExtNum>
        <Highlighter
          highlightClassName="highlight"
          searchWords={[searchText]}
          autoEscape={true}
          textToHighlight={vessel.externalReferenceNumber || ''}
        />
        {vessel.externalReferenceNumber ? null : <Light>Inconnu</Light>}
        {' '}<Light>(Marq. Ext.)</Light>
      </ExtNum>
    </Information>
    <Information>
      <MMSI>
        <Highlighter
          highlightClassName="highlight"
          searchWords={[searchText]}
          autoEscape={true}
          textToHighlight={vessel.mmsi || ''}
        />
        {vessel.mmsi ? null : <Light>Inconnu</Light>}
        {' '}<Light>(MMSI)</Light>
      </MMSI>
      <CallSign>
        <Highlighter
          highlightClassName="highlight"
          searchWords={[searchText]}
          autoEscape={true}
          textToHighlight={vessel.ircs || ''}
        />
        {vessel.ircs ? null : <Light>Inconnu</Light>}
        {' '}<Light>(Call Sign)</Light>
      </CallSign>
    </Information>
  </ListItem>
}

export default VesselSearchItem

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
