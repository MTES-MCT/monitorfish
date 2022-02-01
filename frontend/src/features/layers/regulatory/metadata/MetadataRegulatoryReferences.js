import React from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { SectionTitle, Section, List, Label } from './RegulatoryMetadata.style'
import { Link } from '../../../commonStyles/Backoffice.style'
import { getRegulatoryZoneTextTypeAsText } from '../../../../domain/entities/regulatory'

const MetadataRegulatoryReferences = () => {
  const { regulatoryReferences } = useSelector(state => state.regulatory.regulatoryZoneMetadata)
  return <>{regulatoryReferences && <Section>
    <SectionTitle>Références réglementaires</SectionTitle>
    <List>
    {regulatoryReferences.map(regulatoryReference => {
      return <Reference
          key={regulatoryReference}
          data-cy="regulatory-layers-metadata-references"
        >
        {regulatoryReference.textType &&
          <Label>{getRegulatoryZoneTextTypeAsText(regulatoryReference.textType)}</Label>}
        <Link href={regulatoryReference.url}>{regulatoryReference.reference}</Link>
      </Reference>
    })}
    </List>
  </Section>}</>
}

const Reference = styled.li`
  list-style-type: "→";
  padding-left: 10px;
  font-size: 13px;
`

export default MetadataRegulatoryReferences
