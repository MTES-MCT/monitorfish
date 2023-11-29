import ReactMarkdown from 'react-markdown'

import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'
import { GreenCircle, RedCircle } from '../../../../../commonStyles/Circle.style'
import { fishingPeriodToString } from '../../../../utils'
import { Section, SectionTitle } from '../RegulatoryMetadata.style'

export function FishingPeriodDisplayed() {
  const { fishingPeriod, fishingPeriodText } = useMainAppSelector(state => ({
    fishingPeriod: state.regulatory.regulatoryZoneMetadata?.fishingPeriod,
    fishingPeriodText: fishingPeriodToString(state.regulatory.regulatoryZoneMetadata?.fishingPeriod)
  }))

  return !!fishingPeriod && fishingPeriod.authorized !== undefined && (fishingPeriodText || fishingPeriod.otherInfo) ? (
    <Section data-cy="regulatory-layers-metadata-fishing-period">
      <SectionTitle>
        {fishingPeriod.authorized ? <GreenCircle margin="0 5px 0 0" /> : <RedCircle margin="0 5px 0 0" />}
        Période de pêche {fishingPeriod.authorized ? 'autorisée' : 'interdites'}
      </SectionTitle>
      {fishingPeriodText}
      {fishingPeriod.otherInfo && <ReactMarkdown>{fishingPeriod.otherInfo}</ReactMarkdown>}
    </Section>
  ) : (
    <></>
  )
}
