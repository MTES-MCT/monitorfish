import { useMemo } from 'react'

import { SpecyCatch } from './common/SpecyCatch'
import { CatchDetails } from './FARMessage/CatchDetails'
import { getLatitudeOrDash, getLongitudeOrDash } from './utils'
import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'
import { getDateTime } from '../../../../../../utils'
import { buildCatchArray } from '../../../../utils'
import { WeightType } from '../constants'
import {
  FirstInlineKey,
  SecondInlineKey,
  SpeciesList,
  Table,
  TableBody,
  TableKey,
  TableRow,
  TableValue,
  Zone
} from '../styles'

import type { DISMessageValue } from '../../../../Logbook.types'

type DISMessageProps = Readonly<{
  message: DISMessageValue
}>
export function DISMessage({ message }: DISMessageProps) {
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)

  const catchesWithProperties = useMemo(() => {
    if (!message?.catches) {
      return []
    }

    return buildCatchArray(message.catches)
  }, [message])

  return (
    <>
      {message && (
        <>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Date opération</TableKey>
                  <TableValue>{getDateTime(message.discardDatetimeUtc)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Position opération</TableKey>
                  <TableValue>
                    <FirstInlineKey>Lat.</FirstInlineKey>{' '}
                    {getLatitudeOrDash(coordinatesFormat, message.latitude, message.longitude)}
                    <SecondInlineKey>Lon.</SecondInlineKey>{' '}
                    {getLongitudeOrDash(coordinatesFormat, message.latitude, message.longitude)}
                  </TableValue>
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
