import { useGetGearsQuery } from '@api/gear'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { FlatKeyValue } from '@features/Vessel/components/VesselSidebar/components/common/FlatKeyValue'
import { uniq } from 'lodash-es'
import { useMemo } from 'react'
import styled from 'styled-components'

import { CatchDetails } from './common/CatchDetails'
import { SpecyCatch } from './common/SpecyCatch'
import { getCodeWithNameOrDash, getDatetimeOrDash } from './utils'
import { buildCatchArray, getTotalPNOWeight } from '../../../../utils'
import { WeightType } from '../constants'
import { NoValue, SpeciesList, Table, TableBody, TableKey, TableRow, TableValue, Zone } from '../styles'

import type { Logbook } from '@features/Logbook/Logbook.types'

type PNOMessageProps = Readonly<{
  isManuallyCreated: boolean
  messageValue: Logbook.PnoMessageValue
  tripGears: Logbook.Gear[] | undefined
}>
export function PNOMessage({ isManuallyCreated, messageValue, tripGears }: PNOMessageProps) {
  const getGearsApiQuery = useGetGearsQuery()

  const gearsWithName: Logbook.Gear[] = useMemo(() => {
    if (!getGearsApiQuery.data || !tripGears) {
      return []
    }

    return tripGears.map(tripGear => {
      const gearName = getGearsApiQuery.data?.find(gear => gear.code === tripGear.gear)?.name ?? undefined

      return { ...tripGear, gearName }
    })
  }, [getGearsApiQuery.data, tripGears])

  const catchesWithProperties = useMemo(() => {
    if (!messageValue?.catchOnboard) {
      return []
    }

    return buildCatchArray(messageValue.catchOnboard)
  }, [messageValue])

  const totalPNOWeight = useMemo(() => {
    if (!messageValue?.catchOnboard) {
      return undefined
    }

    return getTotalPNOWeight(messageValue)
  }, [messageValue])

  return (
    <>
      {messageValue && (
        <>
          <Zone>
            <Table>
              <TableBody>
                <TableRow>
                  <TableKey>Date estimée d’arrivée</TableKey>
                  <TableValue>{getDatetimeOrDash(messageValue.predictedArrivalDatetimeUtc)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Date prévue de débarque</TableKey>
                  <TableValue>{getDatetimeOrDash(messageValue.predictedLandingDatetimeUtc)}</TableValue>
                </TableRow>
                {!isManuallyCreated && (
                  <TableRow>
                    <TableKey>Date de début de la marée</TableKey>
                    <TableValue>{getDatetimeOrDash(messageValue.tripStartDate)}</TableValue>
                  </TableRow>
                )}
                <TableRow>
                  <TableKey>Port d’arrivée</TableKey>
                  <TableValue>{getCodeWithNameOrDash(messageValue.port, messageValue.portName)}</TableValue>
                </TableRow>
                <TableRow>
                  <TableKey>Raison du préavis</TableKey>
                  <TableValue>
                    {messageValue.purpose ? (
                      <>
                        {PriorNotification.PURPOSE_LABEL[messageValue.purpose]} ({messageValue.purpose})
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
                  value: uniq(messageValue.catchOnboard?.map(aCatch => aCatch.faoZone) ?? []).join(', ')
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
