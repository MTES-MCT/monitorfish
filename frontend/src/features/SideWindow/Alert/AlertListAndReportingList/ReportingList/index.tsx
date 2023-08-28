import { Accent, Icon, IconButton, THEME } from '@mtes-mct/monitor-ui'
import dayjs from 'dayjs'
import countries from 'i18n-iso-countries'
import { useCallback, useMemo, useRef } from 'react'
import { Checkbox, FlexboxGrid } from 'rsuite'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { REPORTING_LIST_TABLE_OPTIONS } from './constants'
import { getReportingOrigin, getReportingTitle } from './utils'
import { ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS } from '../../../../../domain/entities/alerts/constants'
import { SeaFrontGroup } from '../../../../../domain/entities/seaFront/constants'
import { setEditedReportingInSideWindow } from '../../../../../domain/shared_slices/Reporting'
import { ReportingType } from '../../../../../domain/types/reporting'
import archiveReportings from '../../../../../domain/use_cases/reporting/archiveReportings'
import deleteReportings from '../../../../../domain/use_cases/reporting/deleteReportings'
import { showVessel } from '../../../../../domain/use_cases/vessel/showVessel'
import { useForceUpdate } from '../../../../../hooks/useForceUpdate'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { useTable } from '../../../../../hooks/useTable'
import { CardTable } from '../../../../../ui/card-table/CardTable'
import { CardTableBody } from '../../../../../ui/card-table/CardTableBody'
import { CardTableFilters } from '../../../../../ui/card-table/CardTableFilters'
import { CardTableRow } from '../../../../../ui/card-table/CardTableRow'
import { EmptyCardTable } from '../../../../../ui/card-table/EmptyCardTable'
import { FilterTableInput } from '../../../../../ui/card-table/FilterTableInput'
import { downloadAsCsv } from '../../../../../utils/downloadAsCsv'
import { Flag } from '../../../../VesselList/tableCells'
import { EditReporting } from '../EditReporting'

import type { InfractionSuspicionReporting, PendingAlertReporting } from '../../../../../domain/types/reporting'
import type { CSSProperties, MutableRefObject } from 'react'

type ReportingListProps = {
  selectedSeaFront: SeaFrontGroup
}
export function ReportingList({ selectedSeaFront }: ReportingListProps) {
  const dispatch = useMainAppDispatch()
  const searchInputRef = useRef() as MutableRefObject<HTMLInputElement>
  const { currentReportings } = useMainAppSelector(state => state.reporting)
  const { forceDebouncedUpdate } = useForceUpdate()

  const baseUrl = useMemo(() => window.location.origin, [])

  const currentSeaFrontReportings = useMemo(
    () =>
      currentReportings.filter(
        reporting =>
          ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS[selectedSeaFront] &&
          ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS[selectedSeaFront].seaFronts.includes(reporting.value.seaFront)
      ),
    [currentReportings, selectedSeaFront]
  )

  const { getTableCheckedData, renderTableHead, tableCheckedIds, tableData, toggleTableCheckForId } = useTable<
    InfractionSuspicionReporting | PendingAlertReporting
  >(currentSeaFrontReportings, REPORTING_LIST_TABLE_OPTIONS, [], searchInputRef.current?.value)

  const archive = useCallback(async () => {
    if (!tableCheckedIds.length) {
      return
    }

    await dispatch(archiveReportings(tableCheckedIds.map(Number)))
  }, [dispatch, tableCheckedIds])

  const download = useCallback(() => {
    const checkedCurrentSeaFrontReportings = getTableCheckedData()
    const fileName = `${checkedCurrentSeaFrontReportings.length}-signalements-${dayjs().format('DD-MM-YYYY')}`

    /* eslint-disable sort-keys-fix/sort-keys-fix */
    downloadAsCsv(fileName, checkedCurrentSeaFrontReportings, {
      creationDate: 'Ouvert le',
      'value.dml': 'DML concernée',
      type: {
        label: 'Origine',
        transform: getReportingOrigin
      },
      'value.type': {
        label: 'Titre',
        transform: getReportingTitle
      },
      'value.description': 'Description',
      'value.natinfCode': 'NATINF',
      flagState: 'Pavillon',
      vesselName: 'Navire',
      internalReferenceNumber: 'CFR',
      externalReferenceNumber: 'Marquage ext.',
      ircs: 'C/S',
      underCharter: {
        label: 'Navire sous charte',
        transform: reporting => (reporting.underCharter ? 'OUI' : 'NON')
      },
      'value.seaFront': 'Façade'
    })
  }, [getTableCheckedData])
  /* eslint-enable sort-keys-fix/sort-keys-fix */

  // TODO Rather use a reporting id here than passing a copy of the whole Reporting object.
  const edit = useCallback(
    (isDisabled: boolean, reporting: InfractionSuspicionReporting | PendingAlertReporting) => {
      if (!isDisabled) {
        dispatch(setEditedReportingInSideWindow(reporting))
      }
    },
    [dispatch]
  )

  const focusOnMap = useCallback(
    (reporting: InfractionSuspicionReporting | PendingAlertReporting) => {
      dispatch(showVessel(reporting, false, true))
    },
    [dispatch]
  )

  const remove = useCallback(async () => {
    if (!tableCheckedIds.length) {
      return
    }

    await dispatch(deleteReportings(tableCheckedIds.map(Number)))
  }, [dispatch, tableCheckedIds])

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
          ref={searchInputRef}
          baseUrl={baseUrl}
          data-cy="side-window-reporting-search"
          onChange={forceDebouncedUpdate}
          placeholder="Rechercher un signalement"
          type="text"
        />
        <RightAligned>
          <IconButton
            disabled={!tableCheckedIds.length}
            Icon={Icon.Download}
            onClick={download}
            title={`Télécharger ${tableCheckedIds.length} signalement${tableCheckedIds.length > 1 ? 's' : ''}`}
          />
          <IconButton
            data-cy="archive-reporting-cards"
            disabled={!tableCheckedIds.length}
            Icon={Icon.Archive}
            onClick={archive}
            title={`Archiver ${tableCheckedIds.length} signalement${tableCheckedIds.length > 1 ? 's' : ''}`}
          />
          <IconButton
            data-cy="delete-reporting-cards"
            disabled={!tableCheckedIds.length}
            Icon={Icon.Delete}
            onClick={remove}
            title={`Supprimer ${tableCheckedIds.length} signalement${tableCheckedIds.length > 1 ? 's' : ''}`}
          />
        </RightAligned>
      </CardTableFilters>

      <CardTable
        $hasScroll={tableData.length > 9}
        $width={1353}
        data-cy="side-window-reporting-list"
        style={{ marginTop: 10 }}
      >
        {renderTableHead()}

        <CardTableBody>
          {tableData.map((reporting, index) => {
            const editingIsDisabled = reporting.type === ReportingType.ALERT

            return (
              <CardTableRow key={reporting.id} data-cy="side-window-current-reportings" index={index + 1} style={{}}>
                <FlexboxGrid>
                  <Cell style={columnStyles[0]}>
                    <StyledCheckbox
                      checked={reporting.$isChecked}
                      onChange={() => toggleTableCheckForId(reporting.id)}
                    />
                  </Cell>
                  <Cell style={columnStyles[1]} title={reporting.validationDate || reporting.creationDate}>
                    {timeago.format(reporting.validationDate || reporting.creationDate, 'fr')}
                  </Cell>
                  <Cell style={columnStyles[2]} title={getReportingOrigin(reporting, true)}>
                    {getReportingOrigin(reporting)}
                  </Cell>
                  <Cell style={columnStyles[3]} title={getReportingTitle(reporting, true)}>
                    {getReportingTitle(reporting)}
                  </Cell>
                  <Cell style={columnStyles[4]}>{reporting.value.natinfCode}</Cell>
                  <Cell style={columnStyles[5]} title={getVesselNameTitle(reporting)}>
                    <Flag
                      rel="preload"
                      src={`${baseUrl ? `${baseUrl}/` : ''}flags/${reporting.flagState.toLowerCase()}.svg`}
                      style={{ marginLeft: 0, marginRight: 5, marginTop: -2, width: 18 }}
                      title={countries.getName(reporting.flagState.toLowerCase(), 'fr')}
                    />
                    {reporting.vesselName}
                  </Cell>
                  <Cell style={columnStyles[6]}>{reporting.value.dml}</Cell>
                  <Cell style={columnStyles[7]}>
                    {reporting.underCharter && <UnderCharter>Navire sous charte</UnderCharter>}
                  </Cell>
                  <Separator />
                  <Cell style={columnStyles[8]}>
                    <IconButton
                      accent={Accent.TERTIARY}
                      data-cy="side-window-silenced-alerts-show-vessel"
                      Icon={Icon.ViewOnMap}
                      onClick={() => focusOnMap(reporting)}
                      style={showIconStyle}
                      title="Voir sur la carte"
                    />
                  </Cell>
                  <Cell style={columnStyles[9]}>
                    <IconButton
                      accent={Accent.TERTIARY}
                      data-cy="side-window-edit-reporting"
                      disabled={editingIsDisabled}
                      Icon={Icon.Edit}
                      onClick={() => edit(editingIsDisabled, reporting)}
                      title="Editer le signalement"
                    />
                  </Cell>
                </FlexboxGrid>
              </CardTableRow>
            )
          })}
        </CardTableBody>
        {!tableData.length && <EmptyCardTable>Aucun signalement</EmptyCardTable>}
      </CardTable>
      <EditReporting />
    </Content>
  )
}

const Cell = styled(FlexboxGrid.Item).attrs(() => ({
  role: 'row'
}))``

const UnderCharter = styled.div`
  background: ${p => p.theme.color.mediumSeaGreen} 0% 0% no-repeat padding-box;
  padding: 2px 8px;
  border-radius: 1px;
  color: ${p => p.theme.color.gunMetal};
`
const RightAligned = styled.div`
  align-items: flex-end;
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;

  > button:not(:last-child) {
    margin-right: 10px;
  }
`

const styleCenter = {
  alignItems: 'center',
  display: 'flex',
  height: 15,
  paddingLeft: 10,
  paddingRight: 10
}

const Separator = styled.div`
  border-left: 1px solid ${THEME.color.lightGray};
  height: 41px;
  margin-top: -13px;
`

// TODO Most of these styles are either repetitions or generalizable styles (i.e. ellipsis).
// It's  better to create common pre-styled components covering 70-80% of the cases and custom-wrapped ones
// for the rest. But not via a "detached" collections of style objects, preferably using named components.
// TODO We should really check if applying styles to a real table would not save a lot of code.
// Duplication of styles between heads and rows doesn't seem optimal.
const columnStyles: CSSProperties[] = [
  {
    ...styleCenter,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    paddingLeft: 0,
    paddingRight: 0,
    width: 36
  },
  {
    ...styleCenter,
    width: 112
  },
  {
    ...styleCenter,
    width: 112
  },
  {
    ...styleCenter,
    display: 'inline-block',
    height: 20,
    marginTop: -3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: 288
  },
  {
    ...styleCenter,
    width: 64
  },
  {
    ...styleCenter,
    display: 'inline-block',
    height: 20,
    marginTop: -3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: 224
  },
  {
    ...styleCenter,
    width: 112
  },
  {
    ...styleCenter,
    width: 144
  },
  {
    ...styleCenter,
    height: '100%',
    justifyContent: 'center',
    width: 32
  },
  {
    ...styleCenter,
    justifyContent: 'center',
    width: 32
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
