import countries from 'i18n-iso-countries'
import styled from 'styled-components'

import { getCoordinates } from '../../../../../coordinates'
import { WSG84_PROJECTION } from '../../../../../domain/entities/map/constants'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { getDateTime } from '../../../../../utils'

type COEMessageProps = {
  message: {
    economicZoneEntered: string
    effortZoneEntryDatetimeUtc: string
    faoZoneEntered: string
    latitudeEntered: number
    longitudeEntered: number
    statisticalRectangleEntered: string
    targetSpeciesNameOnEntry: string
    targetSpeciesOnEntry: string
  }
}
export function COEMessage({ message }: COEMessageProps) {
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)

  return (
    <>
      {message ? (
        <>
          <Zone>
            <Fields>
              <TableBody>
                <Field>
                  <Key>Date d&apos;entrée</Key>
                  <Value>
                    {message.effortZoneEntryDatetimeUtc ? (
                      <>
                        {getDateTime(message.effortZoneEntryDatetimeUtc, true)} <Gray>(UTC)</Gray>
                      </>
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
                <Field>
                  <Key>Position d&apos;entrée</Key>
                  <Value>
                    <FirstInlineKey>Lat.</FirstInlineKey>{' '}
                    {message.latitudeEntered && message.longitudeEntered ? (
                      getCoordinates(
                        [message.longitudeEntered, message.latitudeEntered],
                        WSG84_PROJECTION,
                        coordinatesFormat
                      )[0]
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                    <InlineKey>Lon.</InlineKey>{' '}
                    {message.latitudeEntered && message.longitudeEntered ? (
                      getCoordinates(
                        [message.longitudeEntered, message.latitudeEntered],
                        WSG84_PROJECTION,
                        coordinatesFormat
                      )[1]
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                    <br />
                    <FirstInlineKey>ZEE</FirstInlineKey>{' '}
                    {message.economicZoneEntered ? (
                      <>
                        {countries.getName(message.economicZoneEntered, 'fr')} ({message.economicZoneEntered})
                      </>
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                    <br />
                    <FirstInlineKey>Zone FAO</FirstInlineKey>
                    {message.faoZoneEntered ? message.faoZoneEntered : <NoValue>-</NoValue>}
                    <br />
                    <FirstInlineKey>Rect. stat.</FirstInlineKey>
                    {message.statisticalRectangleEntered ? message.statisticalRectangleEntered : <NoValue>-</NoValue>}
                    <br />
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
                  <Value>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {message.targetSpeciesOnEntry && message.targetSpeciesNameOnEntry ? (
                      <>
                        {message.targetSpeciesNameOnEntry} ({message.targetSpeciesOnEntry})
                      </>
                    ) : message.targetSpeciesOnEntry ? (
                      message.targetSpeciesOnEntry
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
              </TableBody>
            </Fields>
          </Zone>
        </>
      ) : null}
    </>
  )
}

const FirstInlineKey = styled.div`
  color: ${p => p.theme.color.slateGray};
  display: inline-block;
  padding: 0px 5px 0px 0;
  font-size: 13px;
`

const InlineKey = styled.div`
  color: ${p => p.theme.color.slateGray};
  display: inline-block;
  padding: 0px 5px 0px 10px;
  font-size: 13px;
`

const Gray = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 300;
`

const TableBody = styled.tbody``

const Zone = styled.div`
  padding: 5px 10px 0px 10px;
  margin-top: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${p => p.theme.color.white};
`

const Fields = styled.table`
  padding: 0px 5px 0 5px;
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
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
  color: ${p => p.theme.color.slateGray};
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
  color: ${p => p.theme.color.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
  display: inline-block;
`
