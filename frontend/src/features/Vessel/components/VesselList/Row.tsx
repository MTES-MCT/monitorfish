import { RedCircle } from '@features/commonStyles/Circle.style'
import {
  displayOnboardFishingSpecies,
  getExpandableRowCellCustomStyle
} from '@features/Vessel/components/VesselList/cells/utils'
import { ActiveVesselType } from '@features/Vessel/schemas/ActiveVesselSchema'
import { Vessel } from '@features/Vessel/Vessel.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { flexRender, type Row as RowType } from '@tanstack/react-table'
import { forwardRef } from 'react'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { None } from './styles'

type RowProps = Readonly<{
  hasWhiteBackground?: boolean
  index: number | undefined
  row: RowType<Vessel.ActiveVessel>
}>
export const Row = forwardRef<HTMLTableRowElement, RowProps>(({ hasWhiteBackground = false, index, row }, ref) => {
  const vessel = row.original
  const gearsByCode = useMainAppSelector(state => state.gear.gearsByCode)
  const speciesByCode = useMainAppSelector(state => state.species.speciesByCode)

  const gears = (function () {
    return (
      vessel.gearsArray?.map(code => {
        const gear = gearsByCode?.[code]
        const gearName = gear?.name ? `– ${gear.name}` : ''

        return (
          <li key={code}>
            {code} {gearName}
          </li>
        )
      }) ?? <></>
    )
  })()

  const speciesOnboardWithName = (function () {
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
            style={getExpandableRowCellCustomStyle(cell.column)}
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
                  ? timeago.format(vessel.lastPositionSentAt, 'fr')
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
            {vessel.activeVesselType === ActiveVesselType.POSITION_ACTIVITY && vessel.segments.length > 0 ? (
              <ExpandedRowList>
                {vessel.segments.map(tripSegment => (
                  <li key={tripSegment}>{`${tripSegment} – ${tripSegment}`}</li>
                ))}
              </ExpandedRowList>
            ) : (
              <None>Aucun segment.</None>
            )}
          </ExpandedRowCell>
          <ExpandedRowCell>
            <ExpandedRowLabel>Engins à bord (FAR)</ExpandedRowLabel>
            {vessel.gearsArray.length > 0 ? (
              <ExpandedRowList>{gears}</ExpandedRowList>
            ) : (
              <None>Aucun engin à bord.</None>
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
