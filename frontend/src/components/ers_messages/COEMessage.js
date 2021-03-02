import React from "react";
import styled from "styled-components";
import {COLORS} from "../../constants/constants";
import {getCoordinates, getDateTime} from "../../utils";
import {WSG84_PROJECTION} from "../../domain/entities/map";
import countries from "i18n-iso-countries";
countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));

const COEMessage = props => {
    return <>
        { props.message ?
            <>
                <Zone>
                    <Fields>
                        <TableBody>
                            <Field>
                                <Key>Date d'entrée</Key>
                                <Value>{props.message.effortZoneEntryDatetimeUtc ? <>{getDateTime(props.message.effortZoneEntryDatetimeUtc, true)} <Gray>(UTC)</Gray></> : <NoValue>-</NoValue>}</Value>
                            </Field>
                            <Field>
                                <Key>Position d'entrée</Key>
                                <Value>
                                    <FirstInlineKey>Lat.</FirstInlineKey> { props.message.latitudeEntered && props.message.longitudeEntered ?
                                    getCoordinates([props.message.latitudeEntered, props.message.longitudeEntered], WSG84_PROJECTION)[0] :
                                    <NoValue>-</NoValue> }
                                    <InlineKey>Lon.</InlineKey> { props.message.latitudeEntered && props.message.longitudeEntered ?
                                    getCoordinates([props.message.latitudeEntered, props.message.longitudeEntered], WSG84_PROJECTION)[1] :
                                    <NoValue>-</NoValue>}<br/>
                                    <FirstInlineKey>ZEE</FirstInlineKey> {props.message.economicZoneEntered ? <>{countries.getName(props.message.economicZoneEntered, 'fr')} ({props.message.economicZoneEntered})</> :
                                    <NoValue>-</NoValue>}<br/>
                                    <FirstInlineKey>Zone FAO</FirstInlineKey>{props.message.faoZoneEntered ? props.message.faoZoneEntered : <NoValue>-</NoValue>}<br/>
                                    <FirstInlineKey>Rect. stat.</FirstInlineKey>{props.message.statisticalRectangleEntered ? props.message.statisticalRectangleEntered : <NoValue>-</NoValue>}<br/>
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
                                <Value>{props.message.targetSpeciesOnEntry && props.message.targetSpeciesNameOnEntry ?
                                    <>{props.message.targetSpeciesNameOnEntry} ({props.message.targetSpeciesOnEntry})</> : props.message.targetSpeciesOnEntry ?
                                        props.message.targetSpeciesOnEntry : <NoValue>-</NoValue>}</Value>
                            </Field>
                        </TableBody>
                    </Fields>
                </Zone>
            </> : null }
    </>
}

const FirstInlineKey = styled.div`
  color: ${COLORS.textGray};
  display: inline-block;
  padding: 0px 5px 0px 0;
  font-size: 13px;
`

const InlineKey = styled.div`
  color: ${COLORS.textGray};
  display: inline-block;
  padding: 0px 5px 0px 10px;
  font-size: 13px;
`

const Gray = styled.span`
  color: ${COLORS.grayDarkerThree};
  font-weight: 300;
`

const TableBody = styled.tbody``

const Zone = styled.div`
  padding: 5px 10px 0px 10px;
  margin-top: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.background};
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
  color: ${COLORS.textGray};
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
  color: ${COLORS.grayDarkerThree};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
`

const NoValue = styled.span`
  color: ${COLORS.grayDarkerTwo};
  font-weight: 300;
  line-height: normal;
  display: inline-block;
`

export default COEMessage
