import { RedCircle } from '@features/commonStyles/Circle.style'
import { useGetFleetSegmentsQuery } from '@features/FleetSegment/apis'
import { getSegmentInfo } from '@features/FleetSegment/components/FleetSegmentsWithTooltip/utils'
import { FLEET_SEGMENT_ORIGIN_LABEL, GEAR_ORIGIN_LABEL } from '@features/FleetSegment/constants'
import {
  displayOnboardFishingSpecies,
  getExpandableRowCellCustomStyle
} from '@features/Vessel/components/VesselList/cells/utils'
import { DEFAULT_VESSEL_LIST_FILTER_VALUES } from '@features/Vessel/components/VesselList/constants'
import { getLastControlDateTimeAndControlType } from '@features/Vessel/components/VesselList/utils'
import { ActivityOrigin, ActivityType } from '@features/Vessel/schemas/ActiveVesselSchema'
import { Vessel } from '@features/Vessel/Vessel.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, pluralize, TableWithSelectableRows, type Undefine } from '@mtes-mct/monitor-ui'
import { type Column, flexRender, type Row as RowType } from '@tanstack/react-table'
import { forwardRef } from 'react'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { None } from './styles'

import type { Gear } from '../../../../domain/types/Gear'
import type { FleetSegment } from '@features/FleetSegment/types'

type RowProps = Readonly<{
  hasWhiteBackground?: boolean
  index: number | undefined
  /**
   * All properties may be undefined when searching
   * */
  row: RowType<Vessel.ActiveVessel | Undefine<Vessel.ActiveVessel>>
}>
export const Row = forwardRef<HTMLTableRowElement, RowProps>(({ hasWhiteBackground = false, index, row }, ref) => {
  const vessel = row.original
  const listFilter = useMainAppSelector(store => store.vessel.listFilterValues)
  const gearsByCode = useMainAppSelector(state => state.gear.gearsByCode)
  const speciesByCode = useMainAppSelector(state => state.species.speciesByCode)
  const { data: fleetSegments } = useGetFleetSegmentsQuery()
  const hasLastControlAtSeaFilter =
    listFilter?.lastControlAtSeaPeriod !== DEFAULT_VESSEL_LIST_FILTER_VALUES.lastControlAtSeaPeriod
  const hasLastControlAtQuayFilter =
    listFilter?.lastControlAtQuayPeriod !== DEFAULT_VESSEL_LIST_FILTER_VALUES.lastControlAtQuayPeriod
  const { lastControlDateTime } = getLastControlDateTimeAndControlType(
    hasLastControlAtSeaFilter,
    hasLastControlAtQuayFilter,
    vessel
  )

  const gears = (function () {
    if (!gearsByCode || !row.getIsExpanded()) {
      return []
    }

    return vessel.gearsArray?.map(getGearListElement(gearsByCode)) ?? []
  })()

  const segments = (function () {
    if (!fleetSegments || !row.getIsExpanded()) {
      return []
    }

    return vessel.segments?.map(getSegmentListElement(fleetSegments, vessel.activityOrigin)) ?? []
  })()

  const speciesOnboardWithName = (function () {
    if (!row.getIsExpanded()) {
      return []
    }

    return (
      vessel.speciesOnboard?.map(specyOnboard => {
        const name = speciesByCode?.[specyOnboard.species]?.name

        return {
          ...specyOnboard,
          name
        }
      }) ?? []
    )
  })()

  return (
    <>
      <TableWithSelectableRows.BodyTr ref={ref} data-id={row.id} data-index={index}>
        {row?.getVisibleCells().map(cell => (
          <ExpandableRowCell
            key={cell.id}
            $hasRightBorder={['hasInfractionSuspicion'].includes(cell.column.id)}
            $hasWhiteBackground={hasWhiteBackground}
            onClick={() => row.toggleExpanded()}
            style={getExpandableRowCellCustomStyle(cell.column as Column<Vessel.ActiveVessel, any>)}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </ExpandableRowCell>
        ))}
      </TableWithSelectableRows.BodyTr>

      {row.getIsExpanded() && (
        <ExpandedRow $hasWhiteBackground={hasWhiteBackground} data-id={`${row.id}-expanded`}>
          <ExpandedRowCell />
          <ExpandedRowCell />
          <ExpandedRowCell>
            <p>
              {!!vessel.internalReferenceNumber && (
                <ExpandedRowValue $isLight>{vessel.internalReferenceNumber} (CFR)</ExpandedRowValue>
              )}
              {!!vessel.ircs && <ExpandedRowValue $isLight>{vessel.ircs} (Call sign)</ExpandedRowValue>}
              {!!vessel.externalReferenceNumber && (
                <ExpandedRowValue $isLight>{vessel.externalReferenceNumber} (Marq. ext.)</ExpandedRowValue>
              )}
              {!!vessel.mmsi && <ExpandedRowValue $isLight>{vessel.mmsi} (MMSI)</ExpandedRowValue>}
            </p>
            <p>
              <ExpandedRowLabel>Longueur du navire :</ExpandedRowLabel>
              <ExpandedRowValue>{vessel.length ? `${vessel.length} m` : '-'}</ExpandedRowValue>
            </p>
            <p>
              <ExpandedRowLabel>Dernière position VMS :</ExpandedRowLabel>
              <ExpandedRowValue>
                {vessel.activityType === ActivityType.POSITION_BASED
                  ? vessel.lastPositionSentAt && timeago.format(vessel.lastPositionSentAt, 'fr')
                  : undefined}
              </ExpandedRowValue>
            </p>
            <p>
              <ExpandedRowLabel>Statut de JPE :</ExpandedRowLabel>
              <ExpandedRowValue>{vessel.lastLogbookMessageDateTime ? 'Equipé' : 'Non équipé'}</ExpandedRowValue>
            </p>
          </ExpandedRowCell>
          <ExpandedRowCell>
            <ExpandedRowLabel>
              {vessel.activityOrigin === ActivityOrigin.FROM_LOGBOOK &&
                `${pluralize('Segment', vessel.segments?.length ?? 0)} ${pluralize('actuel', vessel.segments?.length ?? 0)}`}
              {vessel.activityOrigin === ActivityOrigin.FROM_RECENT_PROFILE &&
                `${pluralize('Segment', vessel.segments?.length ?? 0)} ${pluralize('récent', vessel.segments?.length ?? 0)}`}
              <StyledIconInfo
                size={16}
                title={vessel.activityOrigin && FLEET_SEGMENT_ORIGIN_LABEL[vessel.activityOrigin]}
              />
            </ExpandedRowLabel>
            {vessel.segments?.length ? <ExpandedRowList>{segments}</ExpandedRowList> : <None>Aucun segment.</None>}
          </ExpandedRowCell>
          <ExpandedRowCell>
            <ExpandedRowLabel>
              {vessel.activityOrigin === ActivityOrigin.FROM_LOGBOOK &&
                `${pluralize('Engin', vessel.gearsArray?.length ?? 0)} à bord`}
              {vessel.activityOrigin === ActivityOrigin.FROM_RECENT_PROFILE &&
                `${pluralize('Engin', vessel.gearsArray?.length ?? 0)} ${pluralize('récent', vessel.gearsArray?.length ?? 0)}`}
              <StyledIconInfo size={16} title={vessel.activityOrigin && GEAR_ORIGIN_LABEL[vessel.activityOrigin]} />
            </ExpandedRowLabel>
            {vessel.gearsArray?.length ? <ExpandedRowList>{gears}</ExpandedRowList> : <None>Aucun engin.</None>}
          </ExpandedRowCell>
          <ExpandedRowCell>
            <ExpandedRowLabel>
              Détail des espèces à bord
              <StyledIconInfo size={16} title="à partir des messages de captures" />
            </ExpandedRowLabel>
            {speciesOnboardWithName.length > 0 ? (
              <ExpandedRowList>
                {displayOnboardFishingSpecies(speciesOnboardWithName)}
                {speciesOnboardWithName.length > 5 && <li>etc.</li>}
              </ExpandedRowList>
            ) : (
              <None>Aucune capture à bord.</None>
            )}
          </ExpandedRowCell>
          <ExpandedRowCell>
            {lastControlDateTime && (
              <>
                <ExpandedRowLabel>
                  Résultat du contrôle {vessel.lastControlInfraction && <RedCircle $margin="2" />}
                </ExpandedRowLabel>
                {vessel.lastControlInfraction ? '1 infraction' : "Pas d'infraction"}
              </>
            )}
          </ExpandedRowCell>
          <ExpandedRowCell />
          <ExpandedRowCell />
        </ExpandedRow>
      )}
    </>
  )
})

function getGearListElement(gearsByCode: Record<string, Gear>) {
  return function (code: string) {
    const gear = gearsByCode?.[code]
    const gearName = gear?.name ? `– ${gear.name}` : ''

    return (
      <li key={code}>
        {code} {gearName}
      </li>
    )
  }
}

function getSegmentListElement(fleetSegments: FleetSegment[], activityOrigin: ActivityOrigin | undefined) {
  return function (code: string) {
    const foundSegment = fleetSegments.find(segment => segment.segment === code)

    return (
      <li key={code} title={getSegmentInfo(foundSegment, activityOrigin)}>
        {code} – {foundSegment?.segmentName}
      </li>
    )
  }
}

const StyledIconInfo = styled(Icon.Info)`
  margin-left: 4px;
`

const ExpandableRowCell = styled(TableWithSelectableRows.Td)<{
  $hasWhiteBackground: boolean
}>`
  cursor: pointer;
  user-select: none;
  color: ${p => p.theme.color.charcoal};
  background: ${p => (p.$hasWhiteBackground ? p.theme.color.white : p.theme.color.cultured)};
`

// TODO Add this feature in monitor-ui.
const ExpandedRow = styled(TableWithSelectableRows.BodyTr)<{
  $hasWhiteBackground: boolean
}>`
  > td {
    overflow: hidden !important;
    color: ${p => p.theme.color.charcoal};
    background: ${p => (p.$hasWhiteBackground ? p.theme.color.white : p.theme.color.cultured)};
  }

  &:hover {
    > td {
      /* Hack to disable hover background color in expanded rows */
      background-color: ${p => (p.$hasWhiteBackground ? p.theme.color.white : p.theme.color.cultured)};
    }
  }
`

const ExpandedRowCell = styled(TableWithSelectableRows.Td).attrs(() => ({
  $hasRightBorder: false
}))`
  padding: 8px 16px 16px;
  height: 42px;
  vertical-align: top;
  white-space: normal;

  > p:not(:first-child) {
    margin-top: 16px;
  }
`

const ExpandedRowLabel = styled.span`
  color: ${p => p.theme.color.slateGray};
  display: block;
  font-weight: 400;
  width: 100%;

  .Element-IconBox {
    vertical-align: sub;
  }
`
const ExpandedRowValue = styled.span<{
  $isLight?: boolean
}>`
  color: ${p => (p.$isLight ? p.theme.color.slateGray : 'inherit')};
  display: block;
`
const ExpandedRowList = styled.ul`
  list-style: none;
  padding: 0;
`
