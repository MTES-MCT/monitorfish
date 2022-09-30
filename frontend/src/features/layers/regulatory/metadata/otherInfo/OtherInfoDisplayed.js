import { useSelector } from 'react-redux'
import { Section } from '../RegulatoryMetadata.style'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'

const OtherInfoDisplayed = () => {
  const { otherInfo } = useSelector(state => state.regulatory.regulatoryZoneMetadata)

  return <>
    {
      otherInfo && <Section>
        <MarkdownWithMargin
          data-cy={'regulatory-layers-metadata-other-info'}
        >
          <ReactMarkdown>
            {otherInfo}
          </ReactMarkdown>
        </MarkdownWithMargin>
      </Section>
    }
  </>
}

const MarkdownWithMargin = styled.div``

export default OtherInfoDisplayed
