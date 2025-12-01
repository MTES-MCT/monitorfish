import { useMainAppSelector } from '@hooks/useMainAppSelector'
import ReactMarkdown from 'react-markdown'

import { Section } from './RegulatoryMetadata.style'

export function OtherInfo() {
  const regulatoryZoneMetadata = useMainAppSelector(state => state.regulation.regulatoryZoneMetadata)

  const otherInfo = regulatoryZoneMetadata?.otherInfo

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
