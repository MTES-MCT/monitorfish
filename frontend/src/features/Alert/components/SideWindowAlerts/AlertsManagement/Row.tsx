import {openPriorNotificationCard} from '@features/PriorNotification/useCases/openPriorNotificationCard'
import {
  openPriorNotificationReportingList
} from '@features/PriorNotification/useCases/openPriorNotificationReportingList'
import {getPriorNotificationIdentifier} from '@features/PriorNotification/utils'
import {useMainAppDispatch} from '@hooks/useMainAppDispatch'
import {customDayjs, Icon, TableWithSelectableRows, Tag, THEME} from '@mtes-mct/monitor-ui'
import {flexRender, type Row as RowType} from '@tanstack/react-table'
import {useIsSuperUser} from 'auth/hooks/useIsSuperUser'
import styled from 'styled-components'

import {FixedTag, None} from './styles'
import {
  displayOnboardFishingSpecies,
  getColorsFromState,
  getExpandableRowCellCustomStyle,
  getVesselIdentityFromPriorNotification
} from './utils'
import {PriorNotification} from '../../PriorNotification.types'
import {openManualPriorNotificationForm} from '../../useCases/openManualPriorNotificationForm'
import type {AlertSpecification} from "@features/Alert/types";

type RowProps = Readonly<{
  row: RowType<AlertSpecification>
}>
export function Row({ row }: RowProps) {
  const isSuperUser = useIsSuperUser()

  const alertSpecification = row.original

  return (
    <>
      <TableWithSelectableRows.BodyTr data-id={row.id}>
        {row?.getVisibleCells().map(cell => (
          <ExpandableRowCell
            key={cell.id}
            $hasRightBorder={['natinfCode'].includes(cell.column.id)}
            onClick={() => row.toggleExpanded()}
            style={getExpandableRowCellCustomStyle(cell.column)}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </ExpandableRowCell>
        ))}
      </TableWithSelectableRows.BodyTr>

      {row.getIsExpanded() && (
        <ExpandedRow data-id={`${row.id}-expanded`}>
          <ExpandedRowCell />
          <ExpandedRowCell>
            <p>
              <ExpandedRowLabel>Description</ExpandedRowLabel>
              <ExpandedRowValue>
                {alertSpecification.description}
              </ExpandedRowValue>
            </p>
            {!!alertSpecification.id && <p>
              <ExpandedRowLabel>Position VMS pris en compte</ExpandedRowLabel>
              <ExpandedRowValue>
                {!!alertSpecification.id && alertSpecification.onlyFishingPositions && "Les positions en pêche uniquement"}
                {!!alertSpecification.id && !alertSpecification.onlyFishingPositions && "Toutes les positions en mer"}
              </ExpandedRowValue>
            </p>}
          </ExpandedRowCell>
          <ExpandedRowCell>
            {(alertSpecification.gears?.length > 0) && <p>
              <ExpandedRowLabel>Engins à bord :</ExpandedRowLabel>
              <ExpandedRowValue>
                {alertSpecification.gears
                  .map(gear => `${gear.gear}`)
                  .join(', ')
                }
              </ExpandedRowValue>
            </p>}
            {(alertSpecification.administrativeAreas?.length > 0 || alertSpecification.regulatoryAreas?.length > 0) && <p>
              <ExpandedRowLabel>Zones (VMS) :</ExpandedRowLabel>
              <ExpandedRowValue>
                {alertSpecification.administrativeAreas
                  .map(area => `${area.areaType}: ${area.areas.join(', ')}`)
                  .join(', ')
                }
                {alertSpecification.regulatoryAreas
                  .map(area => `Zone REG "${area.topic} - ${area.zone}"`)
                  .join(', ')
                }
              </ExpandedRowValue>
            </p>}
          </ExpandedRowCell>
          <ExpandedRowCell />
          <ExpandedRowCell />
          <ExpandedRowCell>
            <p>
              {!!alertSpecification.vesselInternalReferenceNumber && (
                <ExpandedRowValue $isLight>{alertSpecification.vesselInternalReferenceNumber} (CFR)</ExpandedRowValue>
              )}
              {!!alertSpecification.vesselIrcs && (
                <ExpandedRowValue $isLight>{alertSpecification.vesselIrcs} (Call sign)</ExpandedRowValue>
              )}
              {!!alertSpecification.vesselExternalReferenceNumber && (
                <ExpandedRowValue $isLight>
                  {alertSpecification.vesselExternalReferenceNumber} (Marq. ext.)
                </ExpandedRowValue>
              )}
              {!!alertSpecification.vesselMmsi && (
                <ExpandedRowValue $isLight>{alertSpecification.vesselMmsi} (MMSI)</ExpandedRowValue>
              )}
            </p>
            <p>
              <ExpandedRowLabel>Taille du navire :</ExpandedRowLabel>
              <ExpandedRowValue>{alertSpecification.vesselLength ?? '-'}</ExpandedRowValue>
            </p>
            <p>
              <ExpandedRowLabel>Dernier contrôle :</ExpandedRowLabel>
              <ExpandedRowValue>
                {alertSpecification.vesselLastControlDateTime
                  ? customDayjs(alertSpecification.vesselLastControlDateTime).utc().format('[Le] DD/MM/YYYY')
                  : '-'}
              </ExpandedRowValue>
            </p>
          </ExpandedRowCell>
          <ExpandedRowCell>
            <ExpandedRowLabel>Nom des segments :</ExpandedRowLabel>
            {alertSpecification.tripSegments.length > 0 ? (
              <ExpandedRowList>
                {alertSpecification.tripSegments.map(tripSegment => (
                  <li key={tripSegment.code}>{`${tripSegment.code} – ${tripSegment.name}`}</li>
                ))}
              </ExpandedRowList>
            ) : (
              <None>Aucun segment.</None>
            )}
          </ExpandedRowCell>
          <ExpandedRowCell>
            <ExpandedRowLabel>Principales espèces à bord :</ExpandedRowLabel>
            {alertSpecification.onBoardCatches.length > 0 ? (
              <ExpandedRowList>{displayOnboardFishingSpecies(alertSpecification.onBoardCatches)}</ExpandedRowList>
            ) : (
              <None>Aucune capture à bord.</None>
            )}
          </ExpandedRowCell>
          <ExpandedRowCell colSpan={2} style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 12 }}>
            <>
              {alertSpecification.isInvalidated && (
                <Tag backgroundColor={THEME.color.maximumRed} color={THEME.color.white} style={{ marginBottom: 16 }}>
                  Invalidé
                </Tag>
              )}
              {!alertSpecification.isInvalidated && !!alertSpecification.state && (
                <FixedTag
                  backgroundColor={getColorsFromState(alertSpecification.state).backgroundColor}
                  borderColor={getColorsFromState(alertSpecification.state).borderColor}
                  color={getColorsFromState(alertSpecification.state).color}
                  style={{ marginBottom: 16 }}
                  title={PriorNotification.STATE_LABEL[alertSpecification.state]}
                >
                  {PriorNotification.STATE_LABEL[alertSpecification.state]}
                </FixedTag>
              )}

              {isSuperUser && alertSpecification.reportingCount > 0 && (
                <FixedTag
                  backgroundColor={THEME.color.maximumRed15}
                  color={THEME.color.maximumRed}
                  onClick={openReportingList}
                  role="link"
                  title="Ouvrir la liste des signalements pour ce navire"
                >{`${
                  alertSpecification.reportingCount
                } signalement${alertSpecification.reportingCount > 1 ? 's' : ''}`}</FixedTag>
              )}
            </>
          </ExpandedRowCell>
        </ExpandedRow>
      )}
    </>
  )
}

const ExpandableRowCell = styled(TableWithSelectableRows.Td)`
  cursor: pointer;
  user-select: none;
  color: ${p => p.theme.color.charcoal};
  background: ${p => p.theme.color.cultured};
`

// TODO Add this feature in monitor-ui.
const ExpandedRow = styled(TableWithSelectableRows.BodyTr)`
  > td {
    overflow: hidden !important;
    color: ${p => p.theme.color.charcoa};
    background: ${p => p.theme.color.cultured};
  }

  &:hover {
    > td {
      /* Hack to disable hover background color in expanded rows */
      background-color: ${p => p.theme.color.cultured};
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

const TagGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`

const Link = styled.button`
  background: none;
  border: none;
  color: ${p => p.theme.color.slateGray};
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  transition: color 0.2s;

  &:hover {
    color: ${p => p.theme.color.gunMetal};
  }
`
