import {
  getCodeWithNameOrDash,
  getCountryNameOrDash,
  getDatetimeOrDash,
  getLatitudeOrDash,
  getLongitudeOrDash,
  getValueOrDash
} from './utils'
import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'
import { FirstInlineKey, SecondInlineKey, Table, TableBody, TableKey, TableRow, TableValue, Zone } from '../styles'

import type { Logbook } from '@features/Logbook/Logbook.types'

type COEMessageProps = {
  messageValue: Logbook.CoeMessageValue
}
export function COEMessage({ messageValue }: COEMessageProps) {
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)

  return (
    <>
      {messageValue && (
        <>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Date d&apos;entrée</TableKey>
                  <TableValue>{getDatetimeOrDash(messageValue.effortZoneEntryDatetimeUtc)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Position d&apos;entrée</TableKey>
                  <TableValue>
                    <FirstInlineKey>Lat.</FirstInlineKey>{' '}
                    {getLatitudeOrDash(coordinatesFormat, messageValue.latitudeEntered, messageValue.longitudeEntered)}
                    <SecondInlineKey>Lon.</SecondInlineKey>{' '}
                    {getLongitudeOrDash(coordinatesFormat, messageValue.latitudeEntered, messageValue.longitudeEntered)}
                    <br />
                    <FirstInlineKey>ZEE</FirstInlineKey> {getCountryNameOrDash(messageValue.economicZoneEntered)}
                    <br />
                    <FirstInlineKey>Zone FAO</FirstInlineKey>
                    {getValueOrDash(messageValue.faoZoneEntered)}
                    <br />
                    <FirstInlineKey>Rect. stat.</FirstInlineKey>
                    {getValueOrDash(messageValue.statisticalRectangleEntered)}
                    <br />
                  </TableValue>
                </TableRow>
              </TableBody>
            </Table>
          </Zone>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Espèces ciblées</TableKey>
                  <TableValue>
                    {getCodeWithNameOrDash(messageValue.targetSpeciesOnEntry, messageValue.targetSpeciesNameOnEntry)}
                  </TableValue>
                </TableRow>
              </TableBody>
            </Table>
          </Zone>
        </>
      )}
    </>
  )
}
