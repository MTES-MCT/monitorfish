import { THEME } from '@mtes-mct/monitor-ui'
import countries from 'i18n-iso-countries'
import Highlighter from 'react-highlight-words'
import styled from 'styled-components'

import type { Vessel } from '../../Vessel.types'

type VesselSearchResultItemProps = Readonly<{
  baseUrl: string
  onClick: (vessel: Vessel.VesselIdentity) => void
  searchQuery: string | undefined
  vessel: Vessel.VesselIdentity
}>
export function VesselSearchResultItem({ baseUrl, onClick, searchQuery, vessel }: VesselSearchResultItemProps) {
  const { flagState } = vessel
  const { vesselName } = vessel

  return (
    <ListItem data-cy="VesselSearch-item" onClick={() => onClick(vessel)}>
      <div>
        {!!flagState && (
          <Flag
            rel="preload"
            src={`${baseUrl}/flags/${flagState.toLowerCase()}.svg`}
            title={countries.getName(flagState, 'fr')}
          />
        )}
        <Name>
          <Highlighter
            autoEscape
            highlightClassName="highlight"
            searchWords={searchQuery ? [searchQuery] : []}
            textToHighlight={vesselName ?? 'SANS NOM'}
          />
        </Name>
      </div>
      <IdentityDataWrapper>{showVesselIdentityData(vessel, searchQuery)}</IdentityDataWrapper>
    </ListItem>
  )
}

const showVesselIdentityData = (vessel: Vessel.VesselIdentity, searchQuery: string | undefined) => {
  const arrayOfInformation = [
    {
      name: 'CFR',
      value: vessel.internalReferenceNumber
    },
    {
      name: 'Marq. Ext.',
      value: vessel.externalReferenceNumber
    },
    {
      name: 'MMSI',
      value: vessel.mmsi
    },
    {
      name: 'Call Sign',
      value: vessel.ircs
    },
    {
      name: 'Balise n°',
      value: vessel.beaconNumber
    }
  ]

  return arrayOfInformation
    .filter(information => information.value)
    .map((information, index) => {
      const informationToShow = (
        <>
          <Highlighter
            autoEscape
            highlightClassName="highlight"
            searchWords={searchQuery ? [searchQuery] : []}
            textToHighlight={information.value ? String(information.value) : ''}
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
  border-bottom: ${THEME.color.lightGray} 1px solid;

  &:hover {
    background: ${THEME.color.gainsboro};
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
  color: #FF3392;
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

const Flag = styled.img<{
  rel?: 'preload'
}>`
  font-size: 25px;
  margin-left: 5px;
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: middle;
`
