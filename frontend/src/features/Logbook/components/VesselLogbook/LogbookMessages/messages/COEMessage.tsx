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

import type { COEMessageValue } from '../../../../Logbook.types'

type COEMessageProps = {
  message: COEMessageValue
}
export function COEMessage({ message }: COEMessageProps) {
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)

  return (
    <>
      {message && (
        <>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Date d&apos;entrée</TableKey>
                  <TableValue>{getDatetimeOrDash(message.effortZoneEntryDatetimeUtc)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Position d&apos;entrée</TableKey>
                  <TableValue>
                    <FirstInlineKey>Lat.</FirstInlineKey>{' '}
                    {getLatitudeOrDash(coordinatesFormat, message.latitudeEntered, message.longitudeEntered)}
                    <SecondInlineKey>Lon.</SecondInlineKey>{' '}
                    {getLongitudeOrDash(coordinatesFormat, message.latitudeEntered, message.longitudeEntered)}
                    <br />
                    <FirstInlineKey>ZEE</FirstInlineKey> {getCountryNameOrDash(message.economicZoneEntered)}
                    <br />
                    <FirstInlineKey>Zone FAO</FirstInlineKey>
                    {getValueOrDash(message.faoZoneEntered)}
                    <br />
                    <FirstInlineKey>Rect. stat.</FirstInlineKey>
                    {getValueOrDash(message.statisticalRectangleEntered)}
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
                    {getCodeWithNameOrDash(message.targetSpeciesOnEntry, message.targetSpeciesNameOnEntry)}
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
