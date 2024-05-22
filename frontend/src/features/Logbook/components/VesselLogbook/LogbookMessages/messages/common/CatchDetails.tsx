import { useMemo } from 'react'
import styled from 'styled-components'

import { LogbookSpeciesPresentation, LogbookSpeciesPreservationState } from '../../../../../constants'
import { WeightType } from '../../constants'
import { NoValue, Table, TableBody, TableKey, TableRow, TableValue } from '../../styles'
import { getCountryName, getCountryNameOrDash, getValueOrDash } from '../utils'

import type { CatchProperty } from '../../../types'

export type CatchDetailsProps = Readonly<{
  specyCatch: CatchProperty
  weightType: WeightType
}>
export function CatchDetails({
  specyCatch: {
    conversionFactor,
    economicZone,
    faoZone,
    presentation,
    preservationState,
    statisticalRectangle,
    weight
  },
  weightType
}: CatchDetailsProps) {
  const presentationFullName = useMemo(() => {
    if (!presentation) {
      return undefined
    }

    if (presentation && LogbookSpeciesPresentation[presentation]) {
      return `${LogbookSpeciesPresentation[presentation]} (${presentation})`
    }

    return presentation
  }, [presentation])

  const preservationFullName = useMemo(() => {
    if (!preservationState) {
      return undefined
    }

    if (preservationState && LogbookSpeciesPreservationState[preservationState]) {
      return `${LogbookSpeciesPreservationState[preservationState]} (${preservationState})`
    }

    return preservationState
  }, [preservationState])

  return (
    <Wrapper key={`${faoZone}${weight}${statisticalRectangle}${economicZone}${presentation}`}>
      <StyledTable>
        <TableBody>
          <TableRow>
            <TableKey>Poids</TableKey>
            <TrimmedTableValue title={`${weight} kg (${weightType})`}>
              {weight ? `${weight} kg` : <NoValue>-</NoValue>}
            </TrimmedTableValue>
          </TableRow>
          <TableRow>
            <TableKey>Présentation</TableKey>
            <TrimmedTableValue title={presentationFullName}>{getValueOrDash(presentationFullName)}</TrimmedTableValue>
          </TableRow>
          <TableRow>
            <TableKey>Préservation</TableKey>
            <TrimmedTableValue title={preservationFullName}>{getValueOrDash(preservationState)}</TrimmedTableValue>
          </TableRow>
          <TableRow>
            <TableKey>Fact. conversion</TableKey>
            <TrimmedTableValue title={conversionFactor?.toString()}>
              {getValueOrDash(conversionFactor)}
            </TrimmedTableValue>
          </TableRow>
        </TableBody>
      </StyledTable>
      <StyledTable>
        <TableBody>
          <TableRow>
            <TableKey />
            <TableValue />
          </TableRow>
          <TableRow>
            <TableKey>ZEE</TableKey>
            <TrimmedTableValue title={getCountryName(economicZone)}>
              {getCountryNameOrDash(economicZone)}
            </TrimmedTableValue>
          </TableRow>
          <TableRow>
            <TableKey>Zone FAO</TableKey>
            <TableValue>{getValueOrDash(faoZone)}</TableValue>
          </TableRow>
          <TableRow>
            <TableKey>Rect. stat.</TableKey>
            <TableValue>{getValueOrDash(statisticalRectangle)}</TableValue>
          </TableRow>
        </TableBody>
      </StyledTable>
    </Wrapper>
  )
}

const StyledTable = styled(Table)`
  margin: 10px 5px 5px 20px;
`

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const TrimmedTableValue = styled(TableValue)`
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  max-width: 90px;
`
