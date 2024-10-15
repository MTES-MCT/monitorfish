import { useMemo } from 'react'

import { CatchDetails } from './common/CatchDetails'
import { SpecyCatch } from './common/SpecyCatch'
import { getCodeWithNameOrDash, getDatetimeOrDash } from './utils'
import { LogbookMessageSender } from '../../../../constants'
import { buildCatchArray } from '../../../../utils'
import { WeightType } from '../constants'
import { NoValue, Table, TableBody, TableKey, TableRow, TableValue, Zone, SpeciesList } from '../styles'

import type { Logbook } from '@features/Logbook/Logbook.types'

type LANMessageProps = Readonly<{
  messageValue: Logbook.LanMessageValue
}>
export function LANMessage({ messageValue }: LANMessageProps) {
  const catchesWithProperties = useMemo(() => {
    if (!messageValue?.catchLanded) {
      return []
    }

    return buildCatchArray(messageValue.catchLanded)
  }, [messageValue])

  return (
    <>
      {messageValue && (
        <>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Date de fin de débarquement</TableKey>
                  <TableValue>{getDatetimeOrDash(messageValue.landingDatetimeUtc)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Port de débarquement</TableKey>
                  <TableValue>{getCodeWithNameOrDash(messageValue.port, messageValue.portName)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Émetteur du message</TableKey>
                  <TableValue>
                    {messageValue.sender ? (
                      <>
                        {LogbookMessageSender[messageValue.sender]} ({messageValue.sender})
                      </>
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </TableValue>
                </TableRow>
              </TableBody>
            </Table>
          </Zone>
          <SpeciesList $hasCatches={!!catchesWithProperties.length}>
            {catchesWithProperties.map(speciesCatch => (
              <SpecyCatch key={`LAN${speciesCatch.species}`} specyCatch={speciesCatch} weightType={WeightType.NET}>
                {speciesCatch.properties.map((specyCatch, specyIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <CatchDetails key={specyIndex} specyCatch={specyCatch} weightType={WeightType.NET} />
                ))}
              </SpecyCatch>
            ))}
          </SpeciesList>
        </>
      )}
    </>
  )
}
