import React from 'react'
import { GreenCircle, RedCircle } from '../../../commonStyles/Circle.style'
import { useSelector } from 'react-redux'
import { SectionTitle, Section, List } from './RegulatoryMetadata.style'
import GearsOrGearCategories from './GearsOrGearCategories'

const MetadataGears = () => {
  const { regulatoryGears } = useSelector(state => state.regulatory.regulatoryZoneMetadata)

  return <>{regulatoryGears && regulatoryGears.authorized !== undefined &&
    <Section>
      <SectionTitle>{regulatoryGears.authorized
        ? <GreenCircle margin={'0 5px 0 0'} />
        : <RedCircle margin={'0 5px 0 0'} />}
        Engins {regulatoryGears.authorized ? 'réglementés' : 'interdits'}
      </SectionTitle>
      <List>
        <GearsOrGearCategories list={regulatoryGears.regulatedGears} />
        <GearsOrGearCategories list={regulatoryGears.regulatedGearCategories} />
      </List>
      {regulatoryGears.otherInfo &&
      <><SectionTitle>Mesures techniques</SectionTitle>
        {regulatoryGears.otherInfo}
      </>}
    </Section>}
  </>
}

export default MetadataGears
