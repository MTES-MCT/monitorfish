import React from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import {
  DEFAULT_AUTHORIZED_REGULATED_GEARS,
  DEFAULT_UNAUTHORIZED_REGULATED_GEARS,
} from '../../../../../domain/entities/regulatory'
import { Section } from '../RegulatoryMetadata.style'
import RegulatedGears from './RegulatedGears'

function GearRegulationDisplayed() {
  const { gearRegulation } = useSelector(state => state.regulatory.regulatoryZoneMetadata)

  const { authorized, otherInfo, unauthorized } = gearRegulation

  const hasAuthorizedContent = regulatedGearsIsNotEmpty(authorized)
  const hasUnauthorizedContent = regulatedGearsIsNotEmpty(unauthorized)
  const gearRegulationIsNotEmpty = hasAuthorizedContent || hasUnauthorizedContent || otherInfo

  return (
    <>
      {gearRegulationIsNotEmpty ? (
        <Section>
          {hasAuthorizedContent ? (
            <RegulatedGears authorized regulatedGearsObject={authorized || DEFAULT_AUTHORIZED_REGULATED_GEARS} />
          ) : null}
          {hasUnauthorizedContent ? (
            <RegulatedGears
              authorized={false}
              hasPreviousRegulatedGearsBloc={hasAuthorizedContent}
              regulatedGearsObject={unauthorized || DEFAULT_UNAUTHORIZED_REGULATED_GEARS}
            />
          ) : null}
          {otherInfo && (
            <MarkdownWithMargin data-cy="regulatory-layers-metadata-gears-other-info">
              <ReactMarkdown>{otherInfo}</ReactMarkdown>
            </MarkdownWithMargin>
          )}
        </Section>
      ) : null}
    </>
  )
}

export const regulatedGearsIsNotEmpty = regulatedGearsObject =>
  regulatedGearsObject?.allGears ||
  regulatedGearsObject?.allTowedGears ||
  regulatedGearsObject?.allPassiveGears ||
  Object.keys(regulatedGearsObject?.regulatedGears || {})?.length ||
  Object.keys(regulatedGearsObject?.regulatedGearCategories || {})?.length ||
  regulatedGearsObject?.selectedCategoriesAndGears?.length ||
  regulatedGearsObject?.derogation

const MarkdownWithMargin = styled.div`
  margin-top: 20px;
`

export default GearRegulationDisplayed
