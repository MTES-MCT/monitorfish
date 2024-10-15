import { getDatetimeOrDash, getLatitudeOrDash, getLongitudeOrDash } from './utils'
import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'
import { FirstInlineKey, SecondInlineKey, Table, TableBody, TableKey, TableRow, TableValue, Zone } from '../styles'

import type { Logbook } from '@features/Logbook/Logbook.types'

type CROMessageProps = {
  messageValue: Logbook.CroMessageValue
}
export function CROMessage({ messageValue }: CROMessageProps) {
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
                  </TableValue>
                </TableRow>
              </TableBody>
            </Table>
          </Zone>
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
