import { getDatetimeOrDash } from './utils'
import { Table, TableBody, TableKey, TableRow, TableValue, Zone } from '../styles'

import type { EOFMessageValue } from '../../../../Logbook.types'

type EOFMessageProps = {
  message: EOFMessageValue
}
export function EOFMessage({ message }: EOFMessageProps) {
  return (
    <>
      {message && (
        <>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Date de fin de pêche</TableKey>
                  <TableValue>{getDatetimeOrDash(message.endOfFishingDatetimeUtc)}</TableValue>
                </TableRow>
              </TableBody>
            </Table>
          </Zone>
        </>
      )}
    </>
  )
}
