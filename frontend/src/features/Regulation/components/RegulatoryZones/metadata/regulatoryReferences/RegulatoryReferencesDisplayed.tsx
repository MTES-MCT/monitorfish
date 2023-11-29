import styled from 'styled-components'

import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'
import { getRegulatoryZoneTextTypeAsText } from '../../../../utils'
import { SectionTitle, Section, List, Label } from '../RegulatoryMetadata.style'

export function RegulatoryReferencesDisplayed() {
  const regulatory = useMainAppSelector(state => state.regulatory)

  const { regulatoryReferences } = regulatory.regulatoryZoneMetadata || {}

  return (
    <>
      {regulatoryReferences && (
        <Section>
          <SectionTitle>Références réglementaires</SectionTitle>
          <List>
            {regulatoryReferences.map(regulatoryReference => (
              <Reference
                key={`${regulatoryReference?.url}${regulatoryReference?.reference}`}
                data-cy="regulatory-layers-metadata-references"
              >
                {regulatoryReference.textType && (
                  <Label>{getRegulatoryZoneTextTypeAsText(regulatoryReference.textType)}</Label>
                )}
                <Link href={regulatoryReference.url} target="_blank">
                  {regulatoryReference.reference}
                </Link>
              </Reference>
            ))}
          </List>
        </Section>
      )}
    </>
  )
}

const Reference = styled.li`
  list-style-type: '→';
  padding-left: 10px;
  font-size: 13px;
`

export const Link = styled.a`
  // LVHA-order
  :link,
  :visited,
  :hover,
  :active {
    color: ${p => p.theme.color.blueGray};
    font-size: 13px;
    cursor: pointer;
    font-weight: 500;
  }
`
