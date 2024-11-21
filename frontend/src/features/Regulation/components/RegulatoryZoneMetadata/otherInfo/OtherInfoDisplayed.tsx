import ReactMarkdown from 'react-markdown'

import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { Section } from '../RegulatoryMetadata.style'

export function OtherInfoDisplayed() {
  const regulatoryZoneMetadata = useMainAppSelector(state => state.regulation.regulatoryZoneMetadata)

  const { otherInfo } = regulatoryZoneMetadata ?? {}

  return (
    <>
      {otherInfo && (
        <Section>
          <div data-cy="regulatory-layers-metadata-other-info">
            <ReactMarkdown>{otherInfo}</ReactMarkdown>
          </div>
        </Section>
      )}
    </>
  )
}
