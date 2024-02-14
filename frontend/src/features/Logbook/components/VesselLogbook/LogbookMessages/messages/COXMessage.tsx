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

import type { COXMessageValue } from '../../../../Logbook.types'

type COXMessageProps = {
  message: COXMessageValue
}
export function COXMessage({ message }: COXMessageProps) {
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)

  return (
    <>
      {message && (
        <>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Date de sortie</TableKey>
                  <TableValue>{getDatetimeOrDash(message.effortZoneExitDatetimeUtc)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Position de sortie</TableKey>
                  <TableValue>
                    <FirstInlineKey>Lat.</FirstInlineKey>{' '}
                    {getLatitudeOrDash(coordinatesFormat, message.latitudeExited, message.longitudeExited)}
                    <SecondInlineKey>Lon.</SecondInlineKey>{' '}
                    {getLongitudeOrDash(coordinatesFormat, message.latitudeExited, message.longitudeExited)}
                    <br />
                    <FirstInlineKey>ZEE</FirstInlineKey> {getCountryNameOrDash(message.economicZoneExited)}
                    <br />
                    <FirstInlineKey>Zone FAO</FirstInlineKey>
                    {getValueOrDash(message.faoZoneExited)}
                    <br />
                    <FirstInlineKey>Rect. stat.</FirstInlineKey>
                    {getValueOrDash(message.statisticalRectangleExited)}
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
                    {getCodeWithNameOrDash(message.targetSpeciesOnExit, message.targetSpeciesNameOnExit)}
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
