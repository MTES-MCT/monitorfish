import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'

import { RegulatedSpecies } from './RegulatedSpecies'
import {
  DEFAULT_AUTHORIZED_REGULATED_SPECIES,
  DEFAULT_UNAUTHORIZED_REGULATED_SPECIES
} from '../../../../../../domain/entities/regulation'
import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'
import { Section } from '../RegulatoryMetadata.style'

export function SpeciesRegulationDisplayed() {
  const regulatory = useMainAppSelector(state => state.regulatory)

  const { speciesRegulation } = regulatory.regulatoryZoneMetadata || {}
  const { authorized, otherInfo, unauthorized } = speciesRegulation || {}
  const hasAuthorizedContent = regulatedSpeciesIsNotEmpty(authorized)
  const hasUnauthorizedContent = regulatedSpeciesIsNotEmpty(unauthorized)
  const speciesRegulationIsNotEmpty = hasAuthorizedContent || hasUnauthorizedContent || otherInfo

  return (
    <>
      {speciesRegulationIsNotEmpty ? (
        <Section>
          {hasAuthorizedContent ? (
            <RegulatedSpecies authorized regulatedSpecies={authorized || DEFAULT_AUTHORIZED_REGULATED_SPECIES} />
          ) : null}
          {hasUnauthorizedContent ? (
            <RegulatedSpecies
              authorized={false}
              hasPreviousRegulatedSpeciesBloc={hasAuthorizedContent}
              regulatedSpecies={unauthorized || DEFAULT_UNAUTHORIZED_REGULATED_SPECIES}
            />
          ) : null}
          {otherInfo && (
            <MarkdownWithMargin
              $hasMargin={hasAuthorizedContent || hasUnauthorizedContent}
              data-cy="regulatory-layers-metadata-species-other-info"
            >
              <ReactMarkdown>{otherInfo}</ReactMarkdown>
            </MarkdownWithMargin>
          )}
        </Section>
      ) : null}
    </>
  )
}

const regulatedSpeciesIsNotEmpty = regulatedSpecies =>
  regulatedSpecies?.speciesGroups?.length > 0 || regulatedSpecies?.species?.length > 0 || regulatedSpecies?.allSpecies

const MarkdownWithMargin = styled.div<{
  $hasMargin: boolean
}>`
  margin-top: ${p => (p.$hasMargin ? 20 : 0)}px;
`
