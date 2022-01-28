import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { Key, Value } from './RegulatoryMetadata.style'
import { useSelector } from 'react-redux'

const Identification = () => {
  const { lawType, topic, region } = useSelector(state => state.regulatory.regulatoryZoneMetadata)
  return <Zone>
    <Fields>
      <Body>
        <Field>
          <Key>Ensemble reg.</Key>
          <Value data-cy={'regulatory-layers-metadata-lawtype'}>
            {lawType || <NoValue>-</NoValue>}
          </Value>
        </Field>
        <Field>
          <Key>Thématique</Key>
          <Value>{topic || <NoValue>-</NoValue>}</Value>
        </Field>
        <Field>
          <Key>Région</Key>
          <Value>{region || <NoValue>-</NoValue>}</Value>
        </Field>
      </Body>
    </Fields>
  </Zone>
}

const NoValue = styled.span`
  color: ${COLORS.slateGray};
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
  border-bottom: 1px solid ${COLORS.lightGray};
`

const Fields = styled.table`
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
  padding: unset;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

export default Identification
