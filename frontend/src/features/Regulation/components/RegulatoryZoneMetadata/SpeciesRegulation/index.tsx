import { useMainAppSelector } from '@hooks/useMainAppSelector.ts'
import ReactMarkdown from 'react-markdown'

import { RegulatedSpecies } from './RegulatedSpecies'
import { DEFAULT_AUTHORIZED_REGULATED_SPECIES, DEFAULT_UNAUTHORIZED_REGULATED_SPECIES } from '../../../utils'
import { MarkdownWithMargin, Section } from '../RegulatoryMetadata.style'
import { regulatedSpeciesIsNotEmpty } from '../utils'

export function SpeciesRegulation() {
  const regulatoryZoneMetadata = useMainAppSelector(state => state.regulation.regulatoryZoneMetadata)

  const authorized = regulatoryZoneMetadata?.speciesRegulation?.authorized
  const otherInfo = regulatoryZoneMetadata?.speciesRegulation?.otherInfo
  const unauthorized = regulatoryZoneMetadata?.speciesRegulation?.unauthorized
  const hasAuthorizedContent = regulatedSpeciesIsNotEmpty(authorized)
  const hasUnauthorizedContent = regulatedSpeciesIsNotEmpty(unauthorized)
  const areSpeciesRegulationEmpty = !hasAuthorizedContent && !hasUnauthorizedContent && !otherInfo

  if (areSpeciesRegulationEmpty) {
    return <></>
  }

  return (
    <>
      <Section>
        {hasAuthorizedContent && (
          <RegulatedSpecies authorized regulatedSpecies={authorized ?? DEFAULT_AUTHORIZED_REGULATED_SPECIES} />
        )}
        {hasUnauthorizedContent && (
          <RegulatedSpecies
            authorized={false}
            hasMarginTop={hasAuthorizedContent}
            regulatedSpecies={unauthorized ?? DEFAULT_UNAUTHORIZED_REGULATED_SPECIES}
          />
        )}
        {otherInfo && (
          <MarkdownWithMargin
            $hasMargin={hasAuthorizedContent || hasUnauthorizedContent}
            data-cy="regulatory-layers-metadata-species-other-info"
          >
            <ReactMarkdown>{otherInfo}</ReactMarkdown>
          </MarkdownWithMargin>
        )}
      </Section>
    </>
  )
}
