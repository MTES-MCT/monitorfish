import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { useMemo } from 'react'

import { SpecyCatch } from './common/SpecyCatch'
import { CatchDetails } from './FARMessage/CatchDetails'
import { getCodeWithNameOrDash, getDatetimeOrDash } from './utils'
import { buildCatchArray, getTotalPNOWeight } from '../../../../utils'
import { WeightType } from '../constants'
import { NoValue, Table, TableBody, TableKey, TableRow, TableValue, Zone, SpeciesList } from '../styles'

import type { PNOMessageValue } from '../../../../Logbook.types'

type PNOMessageProps = Readonly<{
  message: PNOMessageValue
}>
export function PNOMessage({ message }: PNOMessageProps) {
  const catchesWithProperties = useMemo(() => {
    if (!message?.catchOnboard) {
      return []
    }

    return buildCatchArray(message.catchOnboard)
  }, [message])

  const totalPNOWeight = useMemo(() => {
    if (!message?.catchOnboard) {
      return undefined
    }

    return getTotalPNOWeight(message)
  }, [message])

  return (
    <>
      {message && (
        <>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Date estimée d’arrivée</TableKey>
                  <TableValue>{getDatetimeOrDash(message.predictedArrivalDatetimeUtc)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Date prévue de débarque</TableKey>
                  <TableValue>{getDatetimeOrDash(message.predictedLandingDatetimeUtc)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Date de début de la marée</TableKey>
                  <TableValue>{getDatetimeOrDash(message.tripStartDate)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Port d’arrivée</TableKey>
                  <TableValue>{getCodeWithNameOrDash(message.port, message.portName)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Raison du préavis</TableKey>
                  <TableValue>
                    {message.purpose ? (
                      <>
                        {PriorNotification.PURPOSE_LABEL[message.purpose]} ({message.purpose})
                      </>
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Poids total</TableKey>
                  <TableValue>{totalPNOWeight ? <>{totalPNOWeight} kg</> : <NoValue>-</NoValue>}</TableValue>
                </TableRow>
              </TableBody>
            </Table>
          </Zone>
          <SpeciesList $hasCatches={!!catchesWithProperties.length}>
            {catchesWithProperties.map((speciesCatch, index) => (
              <SpecyCatch
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                isLast={catchesWithProperties.length === index + 1}
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
