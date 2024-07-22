import { openPriorNotificationCard } from '@features/PriorNotification/useCases/openPriorNotificationCard'
import { openPriorNotificationForm } from '@features/PriorNotification/useCases/openPriorNotificationForm'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { customDayjs, Icon, TableWithSelectableRows, Tag, THEME } from '@mtes-mct/monitor-ui'
import { flexRender, type Row as RowType } from '@tanstack/react-table'
import { orderBy } from 'lodash'
import styled from 'styled-components'

import { FixedTag, None } from './styles'
import { getColorsFromState, getExpandableRowCellCustomStyle } from './utils'
import { PriorNotification } from '../../PriorNotification.types'

type RowProps = Readonly<{
  row: RowType<PriorNotification.PriorNotification>
}>
export function Row({ row }: RowProps) {
  const dispatch = useMainAppDispatch()

  const priorNotification = row.original
  const firstFiveOnBoardCatchesByWeight = orderBy(priorNotification.onBoardCatches, ['weight'], ['desc']).slice(0, 5)

  const openCard = () => {
    if (priorNotification.isManuallyCreated) {
      dispatch(
        openPriorNotificationForm(
          { operationDate: priorNotification.operationDate, reportId: priorNotification.id },
          priorNotification.fingerprint
        )
      )

      return
    }

    dispatch(
      openPriorNotificationCard(
        {
          operationDate: priorNotification.operationDate,
          reportId: priorNotification.id
        },
        priorNotification.fingerprint,
        priorNotification.isManuallyCreated
      )
    )
  }

  return (
    <>
      <TableWithSelectableRows.BodyTr data-id={row.id}>
        {row?.getVisibleCells().map(cell => (
          <ExpandableRowCell
            key={cell.id}
            $hasRightBorder={['types', 'state'].includes(cell.column.id)}
            onClick={() => row.toggleExpanded()}
            style={getExpandableRowCellCustomStyle(cell.column.id)}
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
              <ExpandedRowLabel>PNO émis :</ExpandedRowLabel>
              <ExpandedRowValue>
                {customDayjs(priorNotification.sentAt).utc().format('DD/MM/YYYY [à] HH[h]mm')}
              </ExpandedRowValue>
            </p>
            <TagGroup>
              {!!priorNotification.acknowledgment && (
                <>
                  {priorNotification.acknowledgment.isSuccess && (
                    <Tag
                      backgroundColor={THEME.color.gainsboro}
                      Icon={Icon.Confirm}
                      iconColor={THEME.color.mediumSeaGreen}
                      withCircleIcon
                    >
                      Acquitté
                    </Tag>
                  )}
                  {!priorNotification.acknowledgment.isSuccess && (
                    <Tag
                      backgroundColor={THEME.color.gainsboro}
                      Icon={Icon.Reject}
                      iconColor={THEME.color.maximumRed}
                      withCircleIcon
                    >
                      Non acquitté
                    </Tag>
                  )}
                </>
              )}
              {priorNotification.isCorrection && (
                <Tag
                  backgroundColor={THEME.color.gainsboro}
                  Icon={Icon.CircleFilled}
                  iconColor={THEME.color.mediumSeaGreen}
                  withCircleIcon
                >
                  Corrigé
                </Tag>
              )}
            </TagGroup>
          </ExpandedRowCell>
          <ExpandedRowCell>
            <p>
              <ExpandedRowLabel>Raison du PNO :</ExpandedRowLabel>
              <ExpandedRowValue>
                {priorNotification.purposeCode ? PriorNotification.PURPOSE_LABEL[priorNotification.purposeCode] : '-'}
              </ExpandedRowValue>
            </p>
          </ExpandedRowCell>
          <ExpandedRowCell />
          <ExpandedRowCell />
          <ExpandedRowCell>
            <p>
              {!!priorNotification.vesselInternalReferenceNumber && (
                <ExpandedRowValue $isLight>{priorNotification.vesselInternalReferenceNumber} (CFR)</ExpandedRowValue>
              )}
              {!!priorNotification.vesselIrcs && (
                <ExpandedRowValue $isLight>{priorNotification.vesselIrcs} (Call sign)</ExpandedRowValue>
              )}
              {!!priorNotification.vesselExternalReferenceNumber && (
                <ExpandedRowValue $isLight>
                  {priorNotification.vesselExternalReferenceNumber} (Marq. ext.)
                </ExpandedRowValue>
              )}
              {!!priorNotification.vesselMmsi && (
                <ExpandedRowValue $isLight>{priorNotification.vesselMmsi} (MMSI)</ExpandedRowValue>
              )}
            </p>
            <p>
              <ExpandedRowLabel>Taille du navire :</ExpandedRowLabel>
              <ExpandedRowValue>{priorNotification.vesselLength ?? '-'}</ExpandedRowValue>
            </p>
            <p>
              <ExpandedRowLabel>Dernier contrôle :</ExpandedRowLabel>
              <ExpandedRowValue>
                {priorNotification.vesselLastControlDateTime
                  ? customDayjs(priorNotification.vesselLastControlDateTime).utc().format('[Le] DD/MM/YYYY')
                  : '-'}
              </ExpandedRowValue>
            </p>
          </ExpandedRowCell>
          <ExpandedRowCell>
            <ExpandedRowLabel>Nom des segments :</ExpandedRowLabel>
            {priorNotification.tripSegments.length > 0 ? (
              <ExpandedRowList>
                {priorNotification.tripSegments.map(tripSegment => (
                  <li key={tripSegment.code}>{`${tripSegment.code} – ${tripSegment.name}`}</li>
                ))}
              </ExpandedRowList>
            ) : (
              <None>Aucun segment.</None>
            )}
          </ExpandedRowCell>
          <ExpandedRowCell>
            <ExpandedRowLabel>Principales espèces à bord :</ExpandedRowLabel>
            {priorNotification.onBoardCatches.length > 0 ? (
              <ExpandedRowList>
                {firstFiveOnBoardCatchesByWeight.map(({ species, speciesName, weight }) => (
                  <StyledLi
                    key={species}
                    title={`${speciesName} (${species}) – ${weight} kg`}
                  >{`${speciesName} (${species}) – ${weight} kg`}</StyledLi>
                ))}
              </ExpandedRowList>
            ) : (
              <None>Aucune capture à bord.</None>
            )}
            {priorNotification.onBoardCatches.length > 5 && (
              <p>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <Link onClick={openCard}>Voir plus de détail</Link>
              </p>
            )}
          </ExpandedRowCell>
          <ExpandedRowCell colSpan={2} style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 12 }}>
            <>
              {!!priorNotification.state && (
                <FixedTag
                  backgroundColor={getColorsFromState(priorNotification.state).backgroundColor}
                  borderColor={getColorsFromState(priorNotification.state).borderColor}
                  color={getColorsFromState(priorNotification.state).color}
                  style={{ marginBottom: 16 }}
                >
                  {PriorNotification.STATE_LABEL[priorNotification.state]}
                </FixedTag>
              )}
              <FixedTag backgroundColor={THEME.color.maximumRed15} color={THEME.color.maximumRed}>{`${
                priorNotification.reportingCount
              } signalement${priorNotification.reportingCount > 1 ? 's' : ''}`}</FixedTag>
            </>
          </ExpandedRowCell>
        </ExpandedRow>
      )}
    </>
  )
}

const StyledLi = styled.li`
  overflow: hidden;
  text-overflow: ellipsis;
  width: 215px;
  white-space: nowrap;
`

// TODO Update in monitor-ui.
const ExpandableRowCell = styled(TableWithSelectableRows.Td)`
  cursor: pointer;
  user-select: none;
`

// TODO Add this feature in monitor-ui.
const ExpandedRow = styled(TableWithSelectableRows.BodyTr)`
  > td {
    overflow: hidden !important;
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
