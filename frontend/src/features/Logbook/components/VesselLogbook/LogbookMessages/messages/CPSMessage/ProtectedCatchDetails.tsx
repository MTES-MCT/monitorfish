import styled from 'styled-components'

import { getHours, getRemainingMinutes } from './utils'
import {
  LogbookProtectedSpeciesFate,
  LogbookProtectedSpeciesHealthState,
  LogbookProtectedSpeciesSex
} from '../../../../../constants'
import { NoValue, Table, TableBody, TableKey, TableRow, TableValue } from '../../styles'
import { getCountryName, getCountryNameOrDash, getValueOrDash } from '../utils'

import type { ProtectedSpeciesCatch } from '../../../../../Logbook.types'

export type ProtectedCatchDetailsProps = {
  specyCatch: ProtectedSpeciesCatch
}
export function ProtectedCatchDetails({ specyCatch }: ProtectedCatchDetailsProps) {
  function careMinutesText() {
    const hours = getHours(specyCatch.careMinutes)
    const minutes = getRemainingMinutes(specyCatch.careMinutes)
    if (hours === undefined) {
      return undefined
    }

    if (hours === 0) {
      return `${minutes} minutes`
    }

    return `${hours} heures et ${minutes} minutes`
  }

  return (
    <Wrapper data-cy="cps-message-species">
      <StyledTable>
        <TableBody>
          <TableRow>
            <TableKey>Nombre</TableKey>
            <TrimmedTableValue title={specyCatch.nbFish?.toString()}>
              {getValueOrDash(specyCatch.nbFish)}
            </TrimmedTableValue>
          </TableRow>
          <TableRow>
            <TableKey>Sexe</TableKey>
            <TrimmedTableValue title={specyCatch.sex && LogbookProtectedSpeciesSex[specyCatch.sex]}>
              {getValueOrDash(specyCatch.sex && LogbookProtectedSpeciesSex[specyCatch.sex])}
            </TrimmedTableValue>
          </TableRow>
          <TableRow>
            <TableKey>Poids</TableKey>
            <TrimmedTableValue title={`${specyCatch.weight} kg (vif)`}>
              {specyCatch.weight ? `${specyCatch.weight} kg` : <NoValue>-</NoValue>}
            </TrimmedTableValue>
          </TableRow>
          <TableRow>
            <TableKey>État de santé</TableKey>
            <TrimmedTableValue
              title={specyCatch.healthState && LogbookProtectedSpeciesHealthState[specyCatch.healthState]}
            >
              {getValueOrDash(specyCatch.healthState && LogbookProtectedSpeciesHealthState[specyCatch.healthState])}
            </TrimmedTableValue>
          </TableRow>
        </TableBody>
      </StyledTable>
      <StyledTable>
        <TableBody>
          <TableRow>
            <TableKey>ZEE</TableKey>
            <TrimmedTableValue title={getCountryName(specyCatch.economicZone)}>
              {getCountryNameOrDash(specyCatch.economicZone)}
            </TrimmedTableValue>
          </TableRow>
          <TableRow>
            <TableKey>Zone FAO</TableKey>
            <TableValue>{getValueOrDash(specyCatch.faoZone)}</TableValue>
          </TableRow>
          <TableRow>
            <TableKey>Rect. stat.</TableKey>
            <TableValue>{getValueOrDash(specyCatch.statisticalRectangle)}</TableValue>
          </TableRow>
          <TableRow>
            <TableKey>Zone d&apos;effort</TableKey>
            <TableValue>{getValueOrDash(specyCatch.effortZone)}</TableValue>
          </TableRow>
        </TableBody>
      </StyledTable>
      <StyledTable>
        <TableBody>
          <TableRow>
            <TableKey>Temps à bord</TableKey>
            <TrimmedTableValue title={careMinutesText()}>{getValueOrDash(careMinutesText())}</TrimmedTableValue>
          </TableRow>
          <TableRow>
            <TableKey>Baguage</TableKey>
            <TableValue>{getValueOrDash(specyCatch.ring)}</TableValue>
          </TableRow>
          <TableRow>
            <TableKey>Devenir</TableKey>
            <TableValue title={specyCatch.fate && LogbookProtectedSpeciesFate[specyCatch.fate]}>
              {getValueOrDash(specyCatch.fate && LogbookProtectedSpeciesFate[specyCatch.fate])}
            </TableValue>
          </TableRow>
          <TableRow>
            <TableKey>Commentaire</TableKey>
            <TableValue>{getValueOrDash(specyCatch.comment)}</TableValue>
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
