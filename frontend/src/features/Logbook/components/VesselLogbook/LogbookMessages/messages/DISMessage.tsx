import { useMemo } from 'react'

import { CatchDetails } from './common/CatchDetails'
import { SpecyCatch } from './common/SpecyCatch'
import { getDateTime } from '../../../../../../utils'
import { buildCatchArray } from '../../../../utils'
import { WeightType } from '../constants'
import { SpeciesList, Table, TableBody, TableKey, TableRow, TableValue, Zone } from '../styles'

import type { Logbook } from '@features/Logbook/Logbook.types'

type DISMessageProps = Readonly<{
  messageValue: Logbook.DisMessageValue
}>
export function DISMessage({ messageValue }: DISMessageProps) {
  const catchesWithProperties = useMemo(() => {
    if (!messageValue?.catches) {
      return []
    }

    return buildCatchArray(messageValue.catches)
  }, [messageValue])

  return (
    <>
      {messageValue && (
        <>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Date opération</TableKey>
                  <TableValue>{getDateTime(messageValue.discardDatetimeUtc)}</TableValue>
                </TableRow>
              </TableBody>
            </Table>
          </Zone>
          <SpeciesList $hasCatches={!!catchesWithProperties.length}>
            {catchesWithProperties.map((speciesCatch, index) => (
              <SpecyCatch
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                specyCatch={speciesCatch}
                weightType={WeightType.LIVE}
              >
                {speciesCatch.properties.map((specyCatch, specyIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <CatchDetails key={specyIndex} specyCatch={specyCatch} weightType={WeightType.LIVE} />
                ))}
              </SpecyCatch>
            ))}
          </SpeciesList>
        </>
      )}
    </>
  )
}
