import { getDatetimeOrDash, getLatitudeOrDash, getLongitudeOrDash } from './utils'
import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'
import { FirstInlineKey, SecondInlineKey, Table, TableBody, TableKey, TableRow, TableValue, Zone } from '../styles'

import type { CROMessageValue } from '../../../../Logbook.types'

type CROMessageProps = {
  message: CROMessageValue
}
export function CROMessage({ message }: CROMessageProps) {
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
                  <TableValue>{getDatetimeOrDash(message.effortZoneExitDatetimeUtc)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Position de sortie</TableKey>
                  <TableValue>
                    <FirstInlineKey>Lat.</FirstInlineKey>{' '}
                    {getLatitudeOrDash(coordinatesFormat, message.latitudeExited, message.longitudeExited)}
                    <SecondInlineKey>Lon.</SecondInlineKey>{' '}
                    {getLongitudeOrDash(coordinatesFormat, message.latitudeExited, message.longitudeExited)}
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
