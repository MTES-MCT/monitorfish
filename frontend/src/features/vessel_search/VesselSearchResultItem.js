import countries from 'i18n-iso-countries'
import React from 'react'
import Highlighter from 'react-highlight-words'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

function VesselSearchResultItem({ searchText, selectVessel, vessel }) {
  const flagState = vessel.flagState || vessel.vesselProperties?.flagState
  const vesselName = vessel.vesselName || vessel.vesselProperties?.vesselName

  return (
    <ListItem data-cy={'vessel-search-item'} onClick={selectVessel}>
      <div>
        {flagState && (
          rel="preload"
          src={`flags/${flagState.toLowerCase()}.svg`}
          title={countries.getName(flagState, 'fr')}
        />
        )}
        <Name>
          <Highlighter
            autoEscape={true}
          highlightClassName="highlight"
          searchWords={[searchText]}
          textToHighlight={vesselName || 'SANS NOM'}
          />
        </Name>
      </div>
      <IdentityDataWrapper>{showVesselIdentityData(vessel, searchText)}</IdentityDataWrapper>
    </ListItem>
  )
}

const showVesselIdentityData = (vessel, searchText) => {
  const arrayOfInformation = [
    {
      name: 'CFR',
      value: vessel.internalReferenceNumber,
    },
    {
      name: 'Marq. Ext.',
      value: vessel.externalReferenceNumber,
    },
    {
      name: 'MMSI',
      value: vessel.mmsi,
    },
    {
      name: 'Call Sign',
      value: vessel.ircs,
    },
    {
      name: 'Balise n°',
      value: vessel.beaconNumber,
    },
  ]

  return arrayOfInformation
    .filter(information => information.value)
    .map((information, index) => {
      const informationToShow = (
        <>
          <Highlighter
            autoEscape
            highlightClassName="highlight"
            searchWords={[searchText]}
            textToHighlight={information.value || ''}
          />{' '}
          <Light>({information.name})</Light>
        </>
      )

      const fifthElement = 5
      if (index + 1 === fifthElement) {
        return (
          <LongIdentityData key={information.value} style={{ flex: index % 2 }}>
            {informationToShow}
          </LongIdentityData>
        )
      }

      return (
        <IdentityData key={information.value} style={{ flex: index % 2 }}>
          {informationToShow}
        </IdentityData>
      )
    })
}

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

export default VesselSearchResultItem
