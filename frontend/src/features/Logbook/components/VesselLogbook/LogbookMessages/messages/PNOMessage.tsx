import { useGetGearsQuery } from '@api/gear'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { FlatKeyValue } from '@features/VesselSidebar/common/FlatKeyValue'
import { uniq } from 'lodash'
import { useMemo } from 'react'
import styled from 'styled-components'

import { CatchDetails } from './common/CatchDetails'
import { SpecyCatch } from './common/SpecyCatch'
import { getCodeWithNameOrDash, getDatetimeOrDash } from './utils'
import { buildCatchArray, getTotalPNOWeight } from '../../../../utils'
import { WeightType } from '../constants'
import { NoValue, SpeciesList, Table, TableBody, TableKey, TableRow, TableValue, Zone } from '../styles'

import type { Gear, PNOMessageValue } from '../../../../Logbook.types'

type PNOMessageProps = Readonly<{
  isManuallyCreated: boolean
  message: PNOMessageValue
  tripGears: Gear[] | undefined
}>
export function PNOMessage({ isManuallyCreated, message, tripGears }: PNOMessageProps) {
  const getGearsApiQuery = useGetGearsQuery()

  const gearsWithName: Array<Gear> = useMemo(() => {
    if (!getGearsApiQuery.data || !tripGears) {
      return []
    }

    return tripGears.map(tripGear => {
      const gearName = getGearsApiQuery.data?.find(gear => gear.code === tripGear.gear)?.name || null

      return { ...tripGear, gearName }
    })
  }, [getGearsApiQuery.data, tripGears])

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
                {!isManuallyCreated && (
                  <TableRow>
                    <TableKey>Date de début de la marée</TableKey>
                    <TableValue>{getDatetimeOrDash(message.tripStartDate)}</TableValue>
                  </TableRow>
                )}
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
          {isManuallyCreated && (
            <StyledFlatKeyValue
              column={[
                {
                  key: 'Engins utilisés',
                  value: gearsWithName
                    .map(gear => (gear.gearName ? `${gear.gearName} (${gear.gear})` : gear.gear))
                    .join(', ')
                },
                {
                  key: 'Zones de pêche',
                  value: uniq(message.catchOnboard.map(aCatch => aCatch.faoZone)).join(', ')
                }
              ]}
            />
          )}
          <SpeciesList $hasCatches={!!catchesWithProperties.length}>
            {catchesWithProperties.map((speciesCatch, index) => (
              <SpecyCatch
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                isOpenable={!isManuallyCreated}
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

const StyledFlatKeyValue = styled(FlatKeyValue)`
  margin: 10px 0px 10px 0px;
`
