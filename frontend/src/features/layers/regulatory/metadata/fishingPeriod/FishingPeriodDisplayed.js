import React from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'

import { fishingPeriodToString } from '../../../../../domain/entities/regulatory'
import { RedCircle, GreenCircle } from '../../../../commonStyles/Circle.style'
import { Section, SectionTitle } from '../RegulatoryMetadata.style'

function FishingPeriodDisplayed() {
  const { fishingPeriod, fishingPeriodText } = useSelector(state => ({
    fishingPeriod: state.regulatory.regulatoryZoneMetadata.fishingPeriod,
    fishingPeriodText: fishingPeriodToString(state.regulatory.regulatoryZoneMetadata.fishingPeriod),
  }))

  return (
    <>
      {fishingPeriod && fishingPeriod.authorized !== undefined && fishingPeriodText && (
        <Section data-cy="regulatory-layers-metadata-fishing-period">
          <SectionTitle>
            {fishingPeriod.authorized ? <GreenCircle margin="0 5px 0 0" /> : <RedCircle margin="0 5px 0 0" />}
            Période de pêche {fishingPeriod.authorized ? 'autorisée' : 'interdites'}
          </SectionTitle>
          {fishingPeriodText}
          {fishingPeriod.otherInfo && <ReactMarkdown>{fishingPeriod.otherInfo}</ReactMarkdown>}
        </Section>
      )}
    </>
  )
}

export default FishingPeriodDisplayed
