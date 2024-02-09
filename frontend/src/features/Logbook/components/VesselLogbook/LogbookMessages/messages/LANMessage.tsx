import { useMemo } from 'react'

import { SpecyCatch } from './common/SpecyCatch'
import { CatchDetails } from './FARMessage/CatchDetails'
import { getCodeWithNameOrDash, getDatetimeOrDash } from './utils'
import { LogbookMessageSender } from '../../../../constants'
import { buildCatchArray } from '../../../../utils'
import { WeightType } from '../constants'
import { NoValue, Table, TableBody, TableKey, TableRow, TableValue, Zone, SpeciesList } from '../styles'

export function LANMessage({ message }) {
  const catchesWithProperties = useMemo(() => {
    if (!message?.catches) {
      return []
    }

    return buildCatchArray(message.catchLanded)
  }, [message])

  return (
    <>
      {message && (
        <>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Date de fin de débarquement</TableKey>
                  <TableValue>{getDatetimeOrDash(message.landingDatetimeUtc)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Port de débarquement</TableKey>
                  <TableValue>{getCodeWithNameOrDash(message.port, message.portName)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Émetteur du message</TableKey>
                  <TableValue>
                    {message.sender ? (
                      <>
                        {LogbookMessageSender[message.sender]} ({message.sender})
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
            {catchesWithProperties.map((speciesCatch, index) => (
              <SpecyCatch
                key={`LAN${speciesCatch.species}`}
                isLast={catchesWithProperties.length === index + 1}
                specyCatch={speciesCatch}
                weightType={WeightType.NET}
              >
                {speciesCatch.properties.map(specyCatch => (
                  <CatchDetails specyCatch={specyCatch} weightType={WeightType.NET} />
                ))}
              </SpecyCatch>
            ))}
          </SpeciesList>
        </>
      )}
    </>
  )
}
