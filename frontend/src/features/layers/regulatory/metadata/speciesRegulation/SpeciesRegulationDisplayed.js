import React from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import {
  DEFAULT_AUTHORIZED_REGULATED_SPECIES,
  DEFAULT_UNAUTHORIZED_REGULATED_SPECIES,
} from '../../../../../domain/entities/regulatory'
import { Section } from '../RegulatoryMetadata.style'
import RegulatedSpecies from './RegulatedSpecies'

function SpeciesRegulationDisplayed() {
  const { speciesRegulation } = useSelector(state => state.regulatory.regulatoryZoneMetadata)
  const { authorized, otherInfo, unauthorized } = speciesRegulation

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
            <MarkdownWithMargin data-cy="regulatory-layers-metadata-species-other-info">
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

const MarkdownWithMargin = styled.div`
  margin-top: 20px;
`

export default SpeciesRegulationDisplayed
