import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'

import { RegulatedSpecies } from './RegulatedSpecies'
import {
  DEFAULT_AUTHORIZED_REGULATED_SPECIES,
  DEFAULT_UNAUTHORIZED_REGULATED_SPECIES
} from '../../../../../../domain/entities/regulation'
import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'
import { Section } from '../RegulatoryMetadata.style'

import type { RegulatedSpecies as RegulatedSpeciesType } from '../../../../../../domain/types/regulation'

export function SpeciesRegulationDisplayed() {
  const regulatory = useMainAppSelector(state => state.regulatory)

  const { speciesRegulation } = regulatory.regulatoryZoneMetadata || {}
  const { authorized, otherInfo, unauthorized } = speciesRegulation || {}
  const hasAuthorizedContent = regulatedSpeciesIsNotEmpty(authorized)
  const hasUnauthorizedContent = regulatedSpeciesIsNotEmpty(unauthorized)
  const speciesRegulationIsEmpty = !hasAuthorizedContent && !hasUnauthorizedContent && !otherInfo

  if (!speciesRegulationIsEmpty) {
    return <></>
  }

  return (
    <>
      <Section>
        {hasAuthorizedContent && (
          <RegulatedSpecies authorized regulatedSpecies={authorized || DEFAULT_AUTHORIZED_REGULATED_SPECIES} />
        )}
        {hasUnauthorizedContent && (
          <RegulatedSpecies
            authorized={false}
            hasPreviousRegulatedSpeciesBloc={hasAuthorizedContent}
            regulatedSpecies={unauthorized || DEFAULT_UNAUTHORIZED_REGULATED_SPECIES}
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

const regulatedSpeciesIsNotEmpty = (regulatedSpecies: RegulatedSpeciesType): boolean =>
  regulatedSpecies?.speciesGroups?.length > 0 || regulatedSpecies?.species?.length > 0 || !!regulatedSpecies?.allSpecies

const MarkdownWithMargin = styled.div<{
  $hasMargin: boolean
}>`
  margin-top: ${p => (p.$hasMargin ? 20 : 0)}px;
`
