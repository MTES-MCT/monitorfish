import Fuse from 'fuse.js'
import countries from 'i18n-iso-countries'
import { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Checkbox, FlexboxGrid } from 'rsuite'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { COLORS } from '../../../constants/constants'
import { AlertsMenuSeaFrontsToSeaFrontList } from '../../../domain/entities/alerts'
import {
  getReportingOrigin,
  getReportingTitle,
  reportingSearchOptions,
  ReportingType
} from '../../../domain/entities/reporting'
import { setEditedReportingInSideWindow } from '../../../domain/shared_slices/Reporting'
import archiveReportings from '../../../domain/use_cases/reporting/archiveReportings'
import deleteReportings from '../../../domain/use_cases/reporting/deleteReportings'
import getVesselVoyage from '../../../domain/use_cases/vessel/getVesselVoyage'
import showVessel from '../../../domain/use_cases/vessel/showVessel'
import { CardTable } from '../../../ui/card-table/CardTable'
import { CardTableBody } from '../../../ui/card-table/CardTableBody'
import { CardTableColumnTitle } from '../../../ui/card-table/CardTableColumnTitle'
import { CardTableFilters } from '../../../ui/card-table/CardTableFilters'
import { CardTableHeader } from '../../../ui/card-table/CardTableHeader'
import { CardTableRow } from '../../../ui/card-table/CardTableRow'
import { EmptyCardTable } from '../../../ui/card-table/EmptyCardTable'
import { FilterTableInput } from '../../../ui/card-table/FilterTableInput'
import { RowVerticalSeparator } from '../../../ui/card-table/RowVerticalSeparator'
import { ReactComponent as ArchiveIconSVG } from '../../icons/Bouton_archiver.svg'
import { ReactComponent as DeleteIconSVG } from '../../icons/Bouton_supprimer.svg'
import { Flag } from '../../vessel_list/tableCells'
import { sortArrayByColumn, SortType } from '../../vessel_list/tableSort'
import EditReporting from './EditReporting'

type ReportingListProps = {
  seaFront: any
}
export function ReportingList({ seaFront }: ReportingListProps) {
  const dispatch = useDispatch()
  const { currentReportings } = useSelector(state => (state as any).reporting)
  const baseUrl = window.location.origin
  const [sortColumn, setSortColumn] = useState<string>('validationDateTimestamp')
  const [sortType, setSortType] = useState<string>(SortType.DESC)
  const [searched, setSearched] = useState<string | undefined>(undefined)
  const [checkedReportingIds, setCheckedReportingIds] = useState<number[]>([])

  useEffect(() => {
    setCheckedReportingIds([])
  }, [seaFront])

  const currentSeaFrontReportings = useMemo(
    () =>
      currentReportings
        .filter(reporting =>
          (AlertsMenuSeaFrontsToSeaFrontList[seaFront.code]?.seaFronts || []).includes(reporting.value.seaFront)
        )
        .map(reporting => ({
          ...reporting,
          dml: reporting.value.dml,
          validationDateTimestamp: new Date(reporting.validationDate).getTime()
        })),
    [currentReportings, seaFront]
  )

  const fuse = useMemo(() => new Fuse(currentSeaFrontReportings, reportingSearchOptions), [currentSeaFrontReportings])

  const filteredReportings = useMemo(() => {
    if (!currentSeaFrontReportings) {
      return []
    }

    if (!searched?.length || searched?.length <= 1) {
      return currentSeaFrontReportings
    }

    return fuse.search(searched).map(result => result.item)
  }, [currentSeaFrontReportings, searched, fuse])

  const sortedReportings = useMemo(
    () => filteredReportings.slice().sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType)),
    [filteredReportings, sortColumn, sortType]
  )

  const sortedAndCheckedReportings = useMemo(
    () =>
      sortedReportings.map(reporting => ({
        ...reporting,
        checked: checkedReportingIds.indexOf(reporting.id) !== -1
      })),
    [sortedReportings, checkedReportingIds]
  )

  function handleSelectReporting(reportingId) {
    if (checkedReportingIds.indexOf(reportingId) !== -1) {
      setCheckedReportingIds(checkedReportingIds.filter(checkedReportingId => checkedReportingId !== reportingId))
    } else {
      setCheckedReportingIds(checkedReportingIds.concat(reportingId))
    }
  }

  const archive = useCallback(() => {
    // TODO Remove ts-ignore once Redux Root State typed
    // @ts-ignore
    dispatch(archiveReportings(checkedReportingIds.map(Number))).then(() => setCheckedReportingIds([]))
  }, [checkedReportingIds, dispatch, setCheckedReportingIds])

  const remove = useCallback(() => {
    // TODO Remove ts-ignore once Redux Root State typed
    // @ts-ignore
    dispatch(deleteReportings(checkedReportingIds.map(Number))).then(() => setCheckedReportingIds([]))
  }, [checkedReportingIds, dispatch, setCheckedReportingIds])

  function edit(disabled, reporting) {
    if (!disabled) {
      dispatch(setEditedReportingInSideWindow(reporting))
    }
  }

  function sortByColumn(nextSortedColumn) {
    setSortColumn(nextSortedColumn)
    setSortType(sortType === SortType.ASC ? SortType.DESC : SortType.ASC)
  }

  function getVesselNameTitle(reporting) {
    return `${reporting.vesselName}
CFR: ${reporting.internalReferenceNumber || ''}
MARQUAGE EXT.: ${reporting.externalReferenceNumber || ''}
IRCS: ${reporting.ircs || ''}
MMSI: ${reporting.mmsi || ''}`
  }

  return (
    <Content>
      <CardTableFilters>
        <FilterTableInput
          baseUrl={baseUrl}
          data-cy="side-window-reporting-search"
          onChange={e => setSearched(e.target.value)}
          placeholder="Rechercher un signalement"
          type="text"
          value={searched}
        />
        <RightAligned>
          {checkedReportingIds.length > 0 && (
            <>
              <ArchiveButton data-cy="archive-reporting-cards" onClick={archive} title="Archiver" />
              <DeleteButton data-cy="delete-reporting-cards" onClick={remove} title="Supprimer" />
            </>
          )}
        </RightAligned>
      </CardTableFilters>
      <CardTable
        $hasScroll={filteredReportings.length > 9}
        $width={1513}
        data-cy="side-window-reporting-list"
        style={{ marginTop: 10 }}
      >
        <CardTableHeader>
          <FlexboxGrid>
            <FlexboxGrid.Item style={columnStyles[0]} />
            <FlexboxGrid.Item style={columnStyles[1]}>
              <CardTableColumnTitle
                dataCy="side-window-order-by-date"
                isAscending={sortType === SortType.ASC}
                isSortable
                isSortColumn={sortColumn === 'validationDateTimestamp'}
                onClick={() => sortByColumn('validationDateTimestamp')}
              >
                Ouvert il y a...
              </CardTableColumnTitle>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={columnStyles[2]}>
              <CardTableColumnTitle>Origine</CardTableColumnTitle>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={columnStyles[3]}>
              <CardTableColumnTitle>Titre</CardTableColumnTitle>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={columnStyles[4]}>
              <CardTableColumnTitle>NATINF</CardTableColumnTitle>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={columnStyles[5]}>
              <CardTableColumnTitle
                isAscending={sortType === SortType.ASC}
                isSortable
                isSortColumn={sortColumn === 'vesselName'}
                onClick={() => sortByColumn('vesselName')}
              >
                Navire
              </CardTableColumnTitle>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={columnStyles[6]}>
              <CardTableColumnTitle
                isAscending={sortType === SortType.ASC}
                isSortable
                isSortColumn={sortColumn === 'dml'}
                onClick={() => sortByColumn('dml')}
              >
                DML concernées
              </CardTableColumnTitle>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </CardTableHeader>
        <CardTableBody>
          {sortedAndCheckedReportings.map((reporting, index) => {
            const editingIsDisabled = reporting.type === ReportingType.ALERT.code

            return (
              <CardTableRow key={reporting.id} data-cy="side-window-current-reportings" index={index + 1}>
                <FlexboxGrid>
                  <FlexboxGrid.Item style={columnStyles[0]}>
                    <StyledCheckbox checked={reporting.checked} onChange={() => handleSelectReporting(reporting.id)} />
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[1]} title={reporting.validationDate}>
                    {timeago.format(reporting.validationDate, 'fr')}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[2]} title={getReportingOrigin(reporting, true)}>
                    {getReportingOrigin(reporting, false)}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[3]} title={getReportingTitle(reporting, true)}>
                    {getReportingTitle(reporting, false)}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[4]}>{reporting.value.natinfCode}</FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[5]} title={getVesselNameTitle(reporting)}>
                    <Flag
                      rel="preload"
                      src={`${baseUrl ? `${baseUrl}/` : ''}flags/${reporting.value.flagState?.toLowerCase()}.svg`}
                      style={{ marginLeft: 0, marginRight: 5, marginTop: -2, width: 18 }}
                      title={countries.getName(reporting.value.flagState?.toLowerCase(), 'fr')}
                    />
                    {reporting.vesselName}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[6]}>{reporting.value.dml}</FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[7]}>
                    {reporting.underCharter && <UnderCharter>Navire sous charte</UnderCharter>}
                  </FlexboxGrid.Item>
                  <RowVerticalSeparator />
                  <FlexboxGrid.Item style={columnStyles[8]}>
                    <Icon
                      alt="Voir sur la carte"
                      data-cy="side-window-silenced-alerts-show-vessel"
                      onClick={() => {
                        const vesselIdentity = { ...reporting }
                        dispatch(showVessel(vesselIdentity, false, false))
                        dispatch(getVesselVoyage(vesselIdentity, undefined, false))
                      }}
                      src={`${baseUrl}/Icone_voir_sur_la_carte.png`}
                      style={showIconStyle}
                      title="Voir sur la carte"
                    />
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[9]}>
                    <Icon
                      alt="Editer le signalement"
                      data-cy="side-window-edit-reporting"
                      onClick={() => edit(editingIsDisabled, reporting)}
                      src={`${baseUrl}/Bouton_edition.png`}
                      style={editIconStyle(editingIsDisabled)}
                      title="Editer le signalement"
                    />
                  </FlexboxGrid.Item>
                </FlexboxGrid>
              </CardTableRow>
            )
          })}
        </CardTableBody>
        {!sortedReportings?.length && <EmptyCardTable>Aucun signalement</EmptyCardTable>}
      </CardTable>
      <EditReporting />
    </Content>
  )
}

const UnderCharter = styled.div`
  background: ${COLORS.mediumSeaGreen} 0% 0% no-repeat padding-box;
  padding: 2px 8px;
  border-radius: 1px;
  color: ${COLORS.gunMetal};
`

const RightAligned = styled.div`
  margin-left: auto;
  align-self: flex-end;
`

const ArchiveButton = styled(ArchiveIconSVG)`
  border: 1px solid ${COLORS.lightGray};
  padding: 6.5px 6px;
  cursor: pointer;
  vertical-align: bottom;
  margin-right: 10px;
`

const DeleteButton = styled(DeleteIconSVG)`
  border: 1px solid ${COLORS.lightGray};
  padding: 7px;
  cursor: pointer;
  vertical-align: bottom;
  margin-right: 10px;
`

const styleCenter = {
  alignItems: 'center',
  display: 'flex',
  height: 15
}

const columnStyles: CSSProperties[] = [
  {
    ...styleCenter,
    paddingRight: 10,
    width: 36
  },
  {
    ...styleCenter,
    paddingRight: 10,
    width: 150
  },
  {
    ...styleCenter,
    paddingRight: 10,
    width: 170
  },
  {
    ...styleCenter,
    display: 'inline-block',
    height: 20,
    marginTop: -3,
    overflow: 'hidden',
    paddingRight: 10,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: 290
  },
  {
    ...styleCenter,
    paddingRight: 10,
    width: 140
  },
  {
    ...styleCenter,
    display: 'inline-block',
    height: 20,
    marginTop: -3,
    overflow: 'hidden',
    paddingRight: 10,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: 220
  },
  {
    ...styleCenter,
    paddingRight: 10,
    width: 180
  },
  {
    ...styleCenter,
    paddingRight: 10,
    width: 145
  },
  {
    ...styleCenter,
    marginLeft: 10,
    paddingRight: 10,
    width: 20
  },
  {
    ...styleCenter,
    marginLeft: 10,
    paddingRight: 10,
    width: 20
  }
]

export const StyledCheckbox = styled(Checkbox)`
  height: 36px;
`

const Content = styled.div`
  width: fit-content;
  padding: 20px 40px 40px 10px;
  margin-bottom: 20px;
`

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const showIconStyle: CSSProperties = {
  cursor: 'pointer',
  flexShrink: 0,
  float: 'right',
  height: 16,
  marginLeft: 'auto',
  paddingRight: 7,
  width: 20
}

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const Icon = styled.img``
const editIconStyle: (disabled: boolean) => CSSProperties = (disabled: boolean) => ({
  cursor: disabled ? 'not-allowed' : 'pointer',
  flexShrink: 0,
  float: 'right',
  marginLeft: 'auto',
  paddingRight: 10
})
