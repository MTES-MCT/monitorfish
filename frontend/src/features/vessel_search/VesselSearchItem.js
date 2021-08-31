import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import countries from 'i18n-iso-countries'
import Highlighter from 'react-highlight-words'

const VesselSearchItem = ({ id, vessel, selectVessel, searchText }) => {
  const showVesselIdentityData = () => {
    const arrayOfInformation = [
      {
        value: vessel.internalReferenceNumber,
        name: 'CFR'
      },
      {
        value: vessel.externalReferenceNumber,
        name: 'Marq. Ext.'
      },
      {
        value: vessel.mmsi,
        name: 'MMSI'
      },
      {
        value: vessel.ircs,
        name: 'Call Sign'
      },
      {
        value: vessel.beaconNumber,
        name: 'Balise n°'
      }
    ]

    return arrayOfInformation
      .filter(information => information.value)
      .map((information, index) => {
        const informationToShow = <>
          <Highlighter
            highlightClassName="highlight"
            searchWords={[searchText]}
            autoEscape={true}
            textToHighlight={information.value || ''}
          />
          {' '}<Light>({information.name})</Light>
        </>

        const fifthElement = 5
        if (index + 1 === fifthElement) {
          return <LongIdentityData
            key={information.value}
            style={{ flex: index % 2 }}
          >
            {informationToShow}
          </LongIdentityData>
        }

        return <IdentityData
          key={information.value}
          style={{ flex: index % 2 }}
        >
          {informationToShow}
        </IdentityData>
      })
  }

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
    <IdentityDataWrapper>
      {showVesselIdentityData()}
    </IdentityDataWrapper>
  </ListItem>
}

export default VesselSearchItem

const ListItem = styled.li`
  padding: 0 5px 5px 7px;
  font-size: 13px;
  text-align: left;
  list-style-type: none;
  cursor: pointer;
  border-bottom: ${COLORS.lightGray} 1px solid;
  
  :hover {
    background: ${COLORS.gainsboro};
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

const IdentityDataWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  font-size: 13px;
  margin-left: 5px;
  color: ${COLORS.slateGray};
  width: 350px;
`

const IdentityData = styled.div`
  font-size: 13px;
  min-width: 140px;
`

const LongIdentityData = styled.div`
  font-size: 13px;
  min-width: 100%;
`

const Flag = styled.img`
  font-size: 25px;
  margin-left: 5px;
  display: inline-block;
  width: 1em;                      
  height: 1em;                      
  vertical-align: middle;
`
