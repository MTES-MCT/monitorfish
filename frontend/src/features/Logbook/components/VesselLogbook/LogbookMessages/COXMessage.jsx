import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../../constants/constants'
import { getCoordinates } from '../../../../../coordinates'
import { getDateTime } from '../../../../../utils'
import { WSG84_PROJECTION } from '../../../../../domain/entities/map/constants'
import countries from 'i18n-iso-countries'
import { useSelector } from 'react-redux'

const COXMessage = props => {
  const { coordinatesFormat } = useSelector(state => state.map)

  return <>
    {props.message
      ? <>
        <Zone>
          <Fields>
            <TableBody>
              <Field>
                <Key>Date de sortie</Key>
                <Value>{props.message.effortZoneExitDatetimeUtc
                  ? <>{getDateTime(props.message.effortZoneExitDatetimeUtc, true)}{' '}
                    <Gray>(UTC)</Gray></>
                  : <NoValue>-</NoValue>}</Value>
              </Field>
              <Field>
                <Key>Position de sortie</Key>
                <Value>
                  <FirstInlineKey>Lat.</FirstInlineKey> {props.message.latitudeExited && props.message.longitudeExited
                    ? getCoordinates([props.message.longitudeExited, props.message.latitudeExited], WSG84_PROJECTION, coordinatesFormat)[0]
                    : <NoValue>-</NoValue>}
                  <InlineKey>Lon.</InlineKey> {props.message.latitudeExited && props.message.longitudeExited
                    ? getCoordinates([props.message.longitudeExited, props.message.latitudeExited], WSG84_PROJECTION, coordinatesFormat)[1]
                    : <NoValue>-</NoValue>}<br/>
                  <FirstInlineKey>ZEE</FirstInlineKey> {props.message.economicZoneExited
                    ? <>{countries.getName(props.message.economicZoneExited, 'fr')} ({props.message.economicZoneExited})</>
                    : <NoValue>-</NoValue>}<br/>
                  <FirstInlineKey>Zone FAO</FirstInlineKey>{props.message.faoZoneExited
                    ? props.message.faoZoneExited
                    : <NoValue>-</NoValue>}<br/>
                  <FirstInlineKey>Rect.
                    stat.</FirstInlineKey>{props.message.statisticalRectangleExited
                    ? props.message.statisticalRectangleExited
                    : <NoValue>-</NoValue>}<br/>
                </Value>
              </Field>
            </TableBody>
          </Fields>
        </Zone>
        <Zone>
          <Fields>
            <TableBody>
              <Field>
                <Key>Espèces ciblées</Key>
                <Value>{props.message.targetSpeciesOnExit && props.message.targetSpeciesNameOnExit
                  ? <>{props.message.targetSpeciesNameOnExit} ({props.message.targetSpeciesOnExit})</>
                  : props.message.targetSpeciesOnExit
                    ? props.message.targetSpeciesOnExit
                    : <NoValue>-</NoValue>}</Value>
              </Field>
            </TableBody>
          </Fields>
        </Zone>
      </>
      : null}
  </>
}

const FirstInlineKey = styled.div`
  color: ${COLORS.slateGray};
  display: inline-block;
  padding: 0px 5px 0px 0;
  font-size: 13px;
`

const InlineKey = styled.div`
  color: ${COLORS.slateGray};
  display: inline-block;
  padding: 0px 5px 0px 10px;
  font-size: 13px;
`

const Gray = styled.span`
  color: ${COLORS.gunMetal};
  font-weight: 300;
`

const TableBody = styled.tbody``

const Zone = styled.div`
  padding: 5px 10px 0px 10px;
  margin-top: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.white};
`

const Fields = styled.table`
  padding: 0px 5px 0 5px;
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
  margin-top: 5px;
  margin-bottom: 5px;
`

const Field = styled.tr`
  margin: 5px 5px 0 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${COLORS.slateGray};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: normal;
`

const Value = styled.td`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
`

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
  display: inline-block;
`

export default COXMessage
