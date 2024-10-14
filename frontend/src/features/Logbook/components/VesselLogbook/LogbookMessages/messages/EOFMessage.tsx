import { getDatetimeOrDash } from './utils'
import { Table, TableBody, TableKey, TableRow, TableValue, Zone } from '../styles'

import type { Logbook } from '@features/Logbook/Logbook.types'

type EOFMessageProps = {
  messageValue: Logbook.EofMessageValue
}
export function EOFMessage({ messageValue }: EOFMessageProps) {
  return (
    <>
      {messageValue && (
        <>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Date de fin de pêche</TableKey>
                  <TableValue>{getDatetimeOrDash(messageValue.endOfFishingDatetimeUtc)}</TableValue>
                </TableRow>
              </TableBody>
            </Table>
          </Zone>
        </>
      )}
    </>
  )
}
