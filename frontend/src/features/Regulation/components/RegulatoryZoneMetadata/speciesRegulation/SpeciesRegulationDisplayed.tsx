import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'

import { RegulatedSpecies } from './RegulatedSpecies'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { DEFAULT_AUTHORIZED_REGULATED_SPECIES, DEFAULT_UNAUTHORIZED_REGULATED_SPECIES } from '../../../utils'
import { Section } from '../RegulatoryMetadata.style'

import type { RegulatedSpecies as RegulatedSpeciesType } from '../../../types'

export function SpeciesRegulationDisplayed() {
  const regulatoryZoneMetadata = useMainAppSelector(state => state.regulation.regulatoryZoneMetadata)

  const { speciesRegulation } = regulatoryZoneMetadata ?? {}
  const { authorized, otherInfo, unauthorized } = speciesRegulation ?? {}
  const hasAuthorizedContent = !isRegulatedSpeciesEmpty(authorized ?? undefined)
  const hasUnauthorizedContent = !isRegulatedSpeciesEmpty(unauthorized ?? undefined)
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
            hasPreviousRegulatedSpeciesBloc={hasAuthorizedContent}
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

const isRegulatedSpeciesEmpty = (regulatedSpecies: RegulatedSpeciesType | undefined): boolean =>
  !regulatedSpecies ||
  (!regulatedSpecies.speciesGroups?.length && !regulatedSpecies.species?.length && !regulatedSpecies.allSpecies)

const MarkdownWithMargin = styled.div<{
  $hasMargin: boolean
}>`
  margin-top: ${p => (p.$hasMargin ? 20 : 0)}px;
`
