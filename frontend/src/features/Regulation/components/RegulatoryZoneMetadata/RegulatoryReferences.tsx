import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { trackEvent } from '@hooks/useTracking'
import styled from 'styled-components'

import { SectionTitle, Section, List, Label } from './RegulatoryMetadata.style'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { getRegulatoryZoneTextTypeAsText } from '../../utils'

export function RegulatoryReferences() {
  const regulatoryZoneMetadata = useMainAppSelector(state => state.regulation.regulatoryZoneMetadata)
  const isSuperUser = useIsSuperUser()

  const { regulatoryReferences } = regulatoryZoneMetadata ?? {}

  const sendTrackEvent = () => {
    trackEvent({
      action: "Ouverture d'un lien Legipêche",
      category: 'EXTERNAL_LINK',
      name: isSuperUser ? 'CNSP' : 'EXT'
    })
  }

  return (
    <>
      {regulatoryReferences && (
        <Section>
          <SectionTitle>Références réglementaires</SectionTitle>
          <StyledList>
            {regulatoryReferences.map(regulatoryReference => (
              <Reference
                key={`${regulatoryReference?.url}${regulatoryReference?.reference}`}
                data-cy="regulatory-layers-metadata-references"
              >
                {regulatoryReference.textType && (
                  <Label>{getRegulatoryZoneTextTypeAsText(regulatoryReference.textType)}</Label>
                )}
                <Link href={regulatoryReference.url} onClick={sendTrackEvent} target="_blank">
                  {regulatoryReference.reference}
                </Link>
              </Reference>
            ))}
          </StyledList>
        </Section>
      )}
    </>
  )
}

const StyledList = styled(List)`
  li {
    margin-left: 16px;
  }
`

const Reference = styled.li`
  list-style-type: '→';
  padding-left: 10px;
  font-size: 13px;
`

export const Link = styled.a`
  // LVHA-order
  &:link,
  &:visited,
  &:hover,
  &:active {
    color: ${p => p.theme.color.blueGray};
    font-size: 13px;
    cursor: pointer;
    font-weight: 500;
  }
`
