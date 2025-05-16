import { RedCircle } from '@features/commonStyles/Circle.style'
import { useGetFleetSegmentsQuery } from '@features/FleetSegment/apis'
import { getSegmentInfo } from '@features/FleetSegment/components/FleetSegmentsWithTooltip/utils'
import { FleetSegmentSource, GearSource } from '@features/FleetSegment/constants'
import { TagInfo } from '@features/Map/components/TagInfo'
import {
  displayOnboardFishingSpecies,
  getExpandableRowCellCustomStyle
} from '@features/Vessel/components/VesselList/cells/utils'
import { ActiveVesselType } from '@features/Vessel/schemas/ActiveVesselSchema'
import { Vessel } from '@features/Vessel/Vessel.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { pluralize, TableWithSelectableRows, THEME, type Undefine } from '@mtes-mct/monitor-ui'
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
  const gearsByCode = useMainAppSelector(state => state.gear.gearsByCode)
  const speciesByCode = useMainAppSelector(state => state.species.speciesByCode)
  const { data: fleetSegments } = useGetFleetSegmentsQuery()

  const gears = (function () {
    if (!gearsByCode || !row.getIsExpanded()) {
      return []
    }

    if (!vessel.gearsArray?.length) {
      return vessel.recentGearsArray?.map(getGearListElement(gearsByCode)) ?? []
    }

    return vessel.gearsArray?.map(getGearListElement(gearsByCode)) ?? []
  })()

  const segments = (function () {
    if (!fleetSegments || !row.getIsExpanded()) {
      return []
    }

    if (!vessel.segments?.length) {
      return vessel.recentSegments?.map(getSegmentListElement(fleetSegments)) ?? []
    }

    return vessel.segments?.map(getSegmentListElement(fleetSegments)) ?? []
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
                {vessel.activeVesselType === ActiveVesselType.POSITION_ACTIVITY
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
            <ExpandedRowLabel>Nom des segments</ExpandedRowLabel>
            {!!vessel.segments?.length || !!vessel.recentSegments?.length ? (
              <>
                {!!vessel.segments?.length && (
                  <>
                    <ExpandedRowList>{segments}</ExpandedRowList>
                    <StyledTagInfo
                      backgroundColor={THEME.color.mediumSeaGreen25}
                      color={THEME.color.charcoal}
                      title={FleetSegmentSource.CURRENT}
                    >
                      {pluralize('Segment', vessel.segments?.length ?? 0)}{' '}
                      {pluralize('actuel', vessel.segments?.length ?? 0)}
                    </StyledTagInfo>
                  </>
                )}
                {!vessel.segments?.length && (
                  <>
                    <ExpandedRowList>{segments}</ExpandedRowList>
                    <StyledTagInfo
                      backgroundColor={THEME.color.goldenPoppy25}
                      color={THEME.color.charcoal}
                      title={FleetSegmentSource.RECENT}
                    >
                      {pluralize('Segment', vessel.recentSegments?.length ?? 0)}{' '}
                      {pluralize('récent', vessel.recentSegments?.length ?? 0)}
                    </StyledTagInfo>
                  </>
                )}
              </>
            ) : (
              <None>Aucun segment.</None>
            )}
          </ExpandedRowCell>
          <ExpandedRowCell>
            <ExpandedRowLabel>
              Engins {!!vessel.gearsArray?.length && 'à bord (FAR)'}
              {!vessel.gearsArray?.length && !!vessel.recentGearsArray?.length && '(7 derniers jours)'}
            </ExpandedRowLabel>
            {!!vessel.gearsArray?.length || !!vessel.recentGearsArray?.length ? (
              <>
                {!!vessel.gearsArray?.length && (
                  <>
                    <ExpandedRowList>{gears}</ExpandedRowList>
                    <StyledTagInfo
                      backgroundColor={THEME.color.mediumSeaGreen25}
                      color={THEME.color.charcoal}
                      title={GearSource.CURRENT}
                    >
                      {pluralize('Engin', vessel.gearsArray?.length ?? 0)} à bord
                    </StyledTagInfo>
                  </>
                )}
                {!vessel.gearsArray?.length && !!vessel.recentGearsArray?.length && (
                  <>
                    <ExpandedRowList>{gears}</ExpandedRowList>
                    <StyledTagInfo
                      backgroundColor={THEME.color.goldenPoppy25}
                      color={THEME.color.charcoal}
                      title={GearSource.RECENT}
                    >
                      {pluralize('Engin', vessel.recentGearsArray?.length ?? 0)}{' '}
                      {pluralize('récent', vessel.recentGearsArray?.length ?? 0)}
                    </StyledTagInfo>
                  </>
                )}
              </>
            ) : (
              <None>Aucun engin.</None>
            )}
          </ExpandedRowCell>
          <ExpandedRowCell>
            <ExpandedRowLabel>Détail des espèces à bord (FAR)</ExpandedRowLabel>
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
            <ExpandedRowLabel>
              Résultat du contrôle {vessel.lastControlInfraction && <RedCircle $margin="2" />}
            </ExpandedRowLabel>
            {vessel.lastControlInfraction ? '1 infraction' : "Pas d'infraction"}
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

function getSegmentListElement(fleetSegments: FleetSegment[]) {
  return function (code: string) {
    const foundSegment = fleetSegments.find(segment => segment.segment === code)

    return (
      <li key={code} title={getSegmentInfo(foundSegment)}>
        {code} – {foundSegment?.segmentName}
      </li>
    )
  }
}

const StyledTagInfo = styled(TagInfo)`
  margin-top: 0;
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

const ExpandedRowCell = styled(TableWithSelectableRows.Td).attrs(props => ({
  ...props,
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
