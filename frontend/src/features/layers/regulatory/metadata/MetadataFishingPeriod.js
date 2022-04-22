import React from 'react'
import { useSelector } from 'react-redux'
import { Section, SectionTitle } from './RegulatoryMetadata.style'
import { RedCircle, GreenCircle } from '../../../commonStyles/Circle.style'
import { fishingPeriodToString } from '../../../../domain/entities/regulatory'
import ReactMarkdown from 'react-markdown'

const MetadataFishingPeriod = () => {
  const {
    fishingPeriod,
    fishingPeriodText
  } = useSelector(state => {
    return {
      fishingPeriod: state.regulatory.regulatoryZoneMetadata.fishingPeriod,
      fishingPeriodText: fishingPeriodToString(state.regulatory.regulatoryZoneMetadata.fishingPeriod)
    }
  })

  return <>
    {
      fishingPeriod && fishingPeriod.authorized !== undefined && fishingPeriodText &&
      <Section data-cy={'regulatory-layers-metadata-fishing-period'}>
        <SectionTitle>
          {
            fishingPeriod.authorized
              ? <GreenCircle margin={'0 5px 0 0'} />
              : <RedCircle margin={'0 5px 0 0'} />
          }
          Période de pêche {fishingPeriod.authorized ? 'autorisée' : 'interdites'}
        </SectionTitle>
        {fishingPeriodText}
        {
          fishingPeriod.otherInfo &&
          <ReactMarkdown>
            {fishingPeriod.otherInfo}
          </ReactMarkdown>
        }
      </Section>
    }
  </>
}

export default MetadataFishingPeriod
