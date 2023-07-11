import { Section } from '../RegulatoryMetadata.style'
import ReactMarkdown from 'react-markdown'
import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'

export function OtherInfoDisplayed() {
  const regulatory = useMainAppSelector(state => state.regulatory)

  const { otherInfo } = regulatory.regulatoryZoneMetadata || {}

  return (
    <>
      {otherInfo && (
        <Section>
          <div data-cy={'regulatory-layers-metadata-other-info'}>
            <ReactMarkdown>{otherInfo}</ReactMarkdown>
          </div>
        </Section>
      )}
    </>
  )
}
