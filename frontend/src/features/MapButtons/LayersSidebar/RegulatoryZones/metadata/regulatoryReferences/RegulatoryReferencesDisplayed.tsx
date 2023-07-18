import styled from 'styled-components'

import { getRegulatoryZoneTextTypeAsText } from '../../../../../../domain/entities/regulation'
import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'
import { SectionTitle, Section, List, Label, Elem } from '../RegulatoryMetadata.style'

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
                  <Elem>
                    <Label>{getRegulatoryZoneTextTypeAsText(regulatoryReference.textType)}</Label>
                  </Elem>
                )}
                <Elem>
                  <Link href={regulatoryReference.url} target="_blank">
                    {regulatoryReference.reference}
                  </Link>
                </Elem>
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
    color: ${p => p.theme.color.blueGray[100]};
    font-size: 13px;
    cursor: pointer;
    font-weight: 500;
  }
`
