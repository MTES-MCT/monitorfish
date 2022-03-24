import React from 'react'
import styled from 'styled-components'
import { GreenCircle, RedCircle } from '../../../commonStyles/Circle.style'
import { useSelector } from 'react-redux'
import { SectionTitle, Section, List, Label } from './RegulatoryMetadata.style'
import GearsOrGearCategories from './GearsOrGearCategories'
import { COLORS } from '../../../../constants/constants'
import InfoPoint from '../../../backoffice/create_regulation/InfoPoint'

const MetadataGears = () => {
  const { regulatoryGears } = useSelector(state => state.regulatory.regulatoryZoneMetadata)
  const {
    authorized,
    regulatedGears,
    regulatedGearCategories,
    derogation,
    otherInfo,
    allGears
  } = regulatoryGears

  return <>{regulatoryGears && authorized !== undefined &&
    <Section data-cy={'regulatory-layers-metadata-gears'}>
      <SectionTitle>{regulatoryGears.authorized
        ? <GreenCircle margin={'0 5px 0 0'} />
        : <RedCircle margin={'0 5px 0 0'} />}
        Engins {regulatoryGears.authorized ? 'réglementés' : 'interdits'}
      </SectionTitle>
      {allGears
        ? <Label>{'Tous les engins'}</Label>
        : <List>
          <GearsOrGearCategories list={regulatedGears} />
          <GearsOrGearCategories list={regulatedGearCategories} />
        </List>}
      {!authorized && derogation &&
        <Derogation>
          <InfoPoint
            margin={'3px 0 0 0'}
            backgroundColor={COLORS.yellow}
            color={COLORS.charcoal}
          />
          <DerogationMessage>
            {'Mesures dérogatoire: consulter les références réglementaires'}
          </DerogationMessage>
        </Derogation>
      }
      {otherInfo &&
      <><SectionTitle>Mesures techniques</SectionTitle>
        {otherInfo}
      </>}
    </Section>}
  </>
}

const Derogation = styled.span`
  display: flex;
  border: 1px solid ${COLORS.yellow};
  padding: 4px 15px 6px 8px;
`

const DerogationMessage = styled.span`
  color: ${COLORS.slateGray};
  margin-left: 4px;
`

export default MetadataGears
