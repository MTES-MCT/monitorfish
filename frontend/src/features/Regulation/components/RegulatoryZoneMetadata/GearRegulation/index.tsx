import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { FrontendError } from '@libs/FrontendError'
import ReactMarkdown from 'react-markdown'

import { RegulatedGears } from './RegulatedGears'
import { DEFAULT_AUTHORIZED_REGULATED_GEARS, DEFAULT_UNAUTHORIZED_REGULATED_GEARS } from '../../../utils'
import { MarkdownWithMargin, Section } from '../RegulatoryMetadata.style'
import { regulatedGearsIsNotEmpty } from '../utils'

export function GearRegulation() {
  const regulatoryZoneMetadata = useMainAppSelector(state => state.regulation.regulatoryZoneMetadata)

  const gearRegulation = regulatoryZoneMetadata?.gearRegulation
  if (!gearRegulation) {
    throw new FrontendError('`GearRegulation` is undefined.')
  }

  const { authorized } = gearRegulation
  const { otherInfo } = gearRegulation
  const { unauthorized } = gearRegulation
  const hasAuthorizedContent = regulatedGearsIsNotEmpty(authorized)
  const hasUnauthorizedContent = regulatedGearsIsNotEmpty(unauthorized)
  const gearRegulationIsNotEmpty = hasAuthorizedContent || hasUnauthorizedContent || otherInfo

  return (
    <>
      {gearRegulationIsNotEmpty && (
        <Section>
          {hasAuthorizedContent && (
            <RegulatedGears authorized regulatedGearsObject={authorized ?? DEFAULT_AUTHORIZED_REGULATED_GEARS} />
          )}
          {hasUnauthorizedContent && (
            <RegulatedGears
              authorized={false}
              hasMarginTop={hasAuthorizedContent}
              regulatedGearsObject={unauthorized ?? DEFAULT_UNAUTHORIZED_REGULATED_GEARS}
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
