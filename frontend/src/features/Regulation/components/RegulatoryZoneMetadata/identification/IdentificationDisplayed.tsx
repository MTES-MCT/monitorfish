import styled from 'styled-components'

import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { Key, Value, Fields, Field } from '../RegulatoryMetadata.style'

export function IdentificationDisplayed() {
  const regulatory = useMainAppSelector(state => state.regulatory)

  const { lawType, region, topic, zone } = regulatory.regulatoryZoneMetadata || {}

  return (
    <Zone>
      <Fields>
        <Body>
          <Field>
            <Key>Ensemble reg.</Key>
            <Value data-cy="regulatory-layers-metadata-lawtype">{lawType || <NoValue>-</NoValue>}</Value>
          </Field>
          <Field>
            <Key>Thématique</Key>
            <Value data-cy="regulatory-layers-metadata-topic">{`${topic}` || <NoValue>-</NoValue>}</Value>
          </Field>
          <Field>
            <Key>Zone</Key>
            <Value data-cy="regulatory-layers-metadata-zone">{`${zone}` || <NoValue>-</NoValue>}</Value>
          </Field>
          <Field>
            <Key>Région</Key>
            <Value data-cy="regulatory-layers-metadata-region">{region || <NoValue>-</NoValue>}</Value>
          </Field>
        </Body>
      </Fields>
    </Zone>
  )
}

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
  font-size: 13px;
  display: block;
`

const Body = styled.tbody``

const Zone = styled.div`
  margin: 0;
  padding: 10px 5px 9px 16px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
`
