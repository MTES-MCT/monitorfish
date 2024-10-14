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

type COXMessageProps = {
  messageValue: Logbook.CoxMessageValue
}
export function COXMessage({ messageValue }: COXMessageProps) {
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)

  return (
    <>
      {messageValue && (
        <>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Date de sortie</TableKey>
                  <TableValue>{getDatetimeOrDash(messageValue.effortZoneExitDatetimeUtc)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Position de sortie</TableKey>
                  <TableValue>
                    <FirstInlineKey>Lat.</FirstInlineKey>{' '}
                    {getLatitudeOrDash(coordinatesFormat, messageValue.latitudeExited, messageValue.longitudeExited)}
                    <SecondInlineKey>Lon.</SecondInlineKey>{' '}
                    {getLongitudeOrDash(coordinatesFormat, messageValue.latitudeExited, messageValue.longitudeExited)}
                    <br />
                    <FirstInlineKey>ZEE</FirstInlineKey> {getCountryNameOrDash(messageValue.economicZoneExited)}
                    <br />
                    <FirstInlineKey>Zone FAO</FirstInlineKey>
                    {getValueOrDash(messageValue.faoZoneExited)}
                    <br />
                    <FirstInlineKey>Rect. stat.</FirstInlineKey>
                    {getValueOrDash(messageValue.statisticalRectangleExited)}
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
                    {getCodeWithNameOrDash(messageValue.targetSpeciesOnExit, messageValue.targetSpeciesNameOnExit)}
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
