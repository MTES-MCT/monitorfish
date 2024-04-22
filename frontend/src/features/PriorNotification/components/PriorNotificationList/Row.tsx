import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Icon, THEME, TableWithSelectableRows, Tag, customDayjs } from '@mtes-mct/monitor-ui'
import { flexRender, type Row as RowType } from '@tanstack/react-table'
import styled from 'styled-components'

import { PriorNotification } from '../../PriorNotification.types'
import { priorNotificationActions } from '../../slice'

type RowProps = Readonly<{
  row: RowType<PriorNotification.PriorNotification>
}>
export function Row({ row }: RowProps) {
  const dispatch = useMainAppDispatch()

  const priorNotification = row.original
  const firstFiveOnBoardCatchesByWeight = [...priorNotification.onBoardCatches]
    .sort((onBoardCatchA, onBoardCatchB) => (onBoardCatchB.weight ?? 0) - (onBoardCatchA.weight ?? 0))
    .slice(0, 5)

  return (
    <>
      <StyledRow>
        {row?.getVisibleCells().map(cell => (
          <ExpandableRow
            key={cell.id}
            $hasRightBorder={cell.column.id === 'alertCount'}
            $width={cell.column.getSize()}
            onClick={() => row.toggleExpanded()}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </ExpandableRow>
        ))}
      </StyledRow>

      {row.getIsExpanded() && (
        <ExpandedRow>
          <ExpandedRowCell $width={40} />
          <ExpandedRowCell $width={130}>
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
          <ExpandedRowCell $width={120}>
            <p>
              <ExpandedRowLabel>Raison du PNO :</ExpandedRowLabel>
              <ExpandedRowValue>
                {priorNotification.purposeCode ? PriorNotification.PURPOSE_LABEL[priorNotification.purposeCode] : '-'}
              </ExpandedRowValue>
            </p>
          </ExpandedRowCell>
          <ExpandedRowCell $width={140} />
          <ExpandedRowCell $width={50} />
          <ExpandedRowCell $width={160}>
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
                {priorNotification.vesselLastControlDate
                  ? customDayjs(priorNotification.vesselLastControlDate).utc().format('[Le] DD/MM/YYYY')
                  : '-'}
              </ExpandedRowValue>
            </p>
          </ExpandedRowCell>
          <ExpandedRowCell $width={130}>
            <ExpandedRowLabel>Nom des segments :</ExpandedRowLabel>
            <span>{priorNotification.tripSegments.map(tripSegment => tripSegment.name).join(', ')}</span>
          </ExpandedRowCell>
          <ExpandedRowCell $width={180}>
            <ExpandedRowLabel>Principales espèces à bord :</ExpandedRowLabel>
            {priorNotification.onBoardCatches.length > 0 ? (
              <ExpandedRowList>
                {firstFiveOnBoardCatchesByWeight.map(({ species, speciesName, weight }) => (
                  <li key={species}>{`${speciesName} (${species}) – ${weight} kg`}</li>
                ))}
              </ExpandedRowList>
            ) : (
              <ExpandedRowValue>Aucune capture à bord.</ExpandedRowValue>
            )}
            <p>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <Link
                onClick={() => dispatch(priorNotificationActions.openPriorNotificationDetail(priorNotification.id))}
              >
                Voir plus de détail
              </Link>
            </p>
          </ExpandedRowCell>
          <ExpandedRowCell $width={72} />
          <ExpandedRowCell $width={64} />
        </ExpandedRow>
      )}
    </>
  )
}

// TODO Update in monitor-ui.
const StyledRow = styled(TableWithSelectableRows.BodyTr)`
  font-weight: 400;
`

// TODO Update in monitor-ui.
const ExpandableRow = styled(TableWithSelectableRows.Td)`
  cursor: pointer;
  font-weight: 400;
  padding: 0 16px 1px;
  user-select: none;
  vertical-align: middle;
`

// TODO Add this feature in monitor-ui.
const ExpandedRow = TableWithSelectableRows.BodyTr

const ExpandedRowCell = styled(TableWithSelectableRows.Td).attrs(props => ({
  ...props,
  $hasRightBorder: false
}))`
  padding: 8px 16px 16px;
  height: 42px;
  white-space: normal;

  > p:not(:first-child) {
    margin-top: 16px;
  }
`

const ExpandedRowLabel = styled.span`
  color: ${p => p.theme.color.slateGray};
  display: block;
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
