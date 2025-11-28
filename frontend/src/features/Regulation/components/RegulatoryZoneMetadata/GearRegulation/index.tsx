import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { FrontendError } from '@libs/FrontendError'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'

import { RegulatedGears } from './RegulatedGears'
import { DEFAULT_AUTHORIZED_REGULATED_GEARS, DEFAULT_UNAUTHORIZED_REGULATED_GEARS } from '../../../utils'
import { Section } from '../RegulatoryMetadata.style'

export function GearRegulation() {
  const regulatoryZoneMetadata = useMainAppSelector(state => state.regulation.regulatoryZoneMetadata)

  const { gearRegulation } = regulatoryZoneMetadata ?? {}
  if (!gearRegulation) {
    throw new FrontendError('`GearRegulation` is undefined.')
  }

  const { authorized, otherInfo, unauthorized } = gearRegulation
  const hasAuthorizedContent = regulatedGearsIsNotEmpty(authorized)
  const hasUnauthorizedContent = regulatedGearsIsNotEmpty(unauthorized)
  const gearRegulationIsNotEmpty = hasAuthorizedContent || hasUnauthorizedContent || otherInfo

  return (
    <>
      {gearRegulationIsNotEmpty && (
        <Section>
          {hasAuthorizedContent && (
            <RegulatedGears authorized regulatedGearsObject={authorized || DEFAULT_AUTHORIZED_REGULATED_GEARS} />
          )}
          {hasUnauthorizedContent && (
            <RegulatedGears
              authorized={false}
              hasPreviousRegulatedGearsBloc={hasAuthorizedContent}
              regulatedGearsObject={unauthorized || DEFAULT_UNAUTHORIZED_REGULATED_GEARS}
            />
          )}
          {otherInfo && (
            <MarkdownWithMargin
              $hasMargin={hasAuthorizedContent || hasUnauthorizedContent}
              data-cy="regulatory-layers-metadata-gears-other-info"
            >
              <ReactMarkdown>{otherInfo}</ReactMarkdown>
            </MarkdownWithMargin>
          )}
        </Section>
      )}
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

const MarkdownWithMargin = styled.div<{
  $hasMargin: boolean
}>`
  margin-top: ${p => (p.$hasMargin ? 16 : 0)}px;
`
