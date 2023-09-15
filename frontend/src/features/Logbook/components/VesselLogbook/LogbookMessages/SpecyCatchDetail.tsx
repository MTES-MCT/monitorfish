import countries from 'i18n-iso-countries'
import { useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../../constants/constants'
import { LogbookSpeciesPresentation, LogbookSpeciesPreservationState } from '../../../constants'

import type { WeightType } from './LogbookMessageSpecy'
import type { LogbookCatch } from '../../../logbook.types'
import type { HTMLProps } from 'react'

type SpecyCatchDetailType = {
  specyCatch: LogbookCatch
  weightType: WeightType
}
export function SpecyCatchDetail({
  specyCatch: {
    conversionFactor,
    economicZone,
    faoZone,
    presentation,
    preservationState,
    species,
    statisticalRectangle,
    weight
  },
  weightType
}: SpecyCatchDetailType) {
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
    <Property key={`${species}${faoZone}${weight}${economicZone}${presentation}`}>
      <Fields>
        <TableBody>
          <Field>
            <Key>Poids</Key>
            <TrimmedValue title={`${weight} kg (${weightType})`}>
              {weight ? `${weight} kg` : <NoValue>-</NoValue>}
            </TrimmedValue>
          </Field>
          <Field>
            <Key>Présentation</Key>
            <TrimmedValue title={presentationFullName}>{presentationFullName || <NoValue>-</NoValue>}</TrimmedValue>
          </Field>
          <Field>
            <Key>Préservation</Key>
            <TrimmedValue title={preservationFullName}>{preservationState || <NoValue>-</NoValue>}</TrimmedValue>
          </Field>
          <Field>
            <Key>Fact. conversion</Key>
            <TrimmedValue title={conversionFactor?.toString()}>{conversionFactor || <NoValue>-</NoValue>}</TrimmedValue>
          </Field>
        </TableBody>
      </Fields>
      <Fields>
        <TableBody>
          <Field>
            <Key />
            <Value />
          </Field>
          <Field>
            <Key>ZEE</Key>
            <TrimmedValue
              title={economicZone ? `${countries.getName(economicZone, 'fr')} (${economicZone})` : undefined}
            >
              {economicZone ? `${countries.getName(economicZone, 'fr')} (${economicZone})` : <NoValue>-</NoValue>}
            </TrimmedValue>
          </Field>
          <Field>
            <Key>Zone FAO</Key>
            <Value>{faoZone || <NoValue>-</NoValue>}</Value>
          </Field>
          <Field>
            <Key>Rect. stat.</Key>
            <Value>{statisticalRectangle || <NoValue>-</NoValue>}</Value>
          </Field>
        </TableBody>
      </Fields>
    </Property>
  )
}

const Property = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const TableBody = styled.tbody``

const Fields = styled.table`
  padding: 10px 5px 5px 20px;
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${COLORS.slateGray};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: normal;
`

const TrimmedValue = styled.td<HTMLProps<HTMLDivElement>>`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  max-width: 90px;
`

const Value = styled.td`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
`

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
  width: 50px;
  display: inline-block;
`
