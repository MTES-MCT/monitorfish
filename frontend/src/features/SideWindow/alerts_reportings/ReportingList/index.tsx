import { Accent, Icon, IconButton, THEME } from '@mtes-mct/monitor-ui'
import dayjs from 'dayjs'
import countries from 'i18n-iso-countries'
import { useCallback, useMemo, useRef } from 'react'
import { Checkbox, FlexboxGrid } from 'rsuite'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { REPORTING_LIST_TABLE_OPTIONS } from './constants'
import { getReportingOrigin, getReportingTitle } from './utils'
import { ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS, SeaFront } from '../../../../domain/entities/alerts/constants'
import { setEditedReportingInSideWindow } from '../../../../domain/shared_slices/Reporting'
import { InfractionSuspicionReporting, PendingAlertReporting, ReportingType } from '../../../../domain/types/reporting'
import archiveReportings from '../../../../domain/use_cases/reporting/archiveReportings'
import deleteReportings from '../../../../domain/use_cases/reporting/deleteReportings'
import { getVesselVoyage } from '../../../../domain/use_cases/vessel/getVesselVoyage'
import { showVessel } from '../../../../domain/use_cases/vessel/showVessel'
import { useForceUpdate } from '../../../../hooks/useForceUpdate'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { useTable } from '../../../../hooks/useTable'
import { CardTable } from '../../../../ui/card-table/CardTable'
import { CardTableBody } from '../../../../ui/card-table/CardTableBody'
import { CardTableFilters } from '../../../../ui/card-table/CardTableFilters'
import { CardTableRow } from '../../../../ui/card-table/CardTableRow'
import { EmptyCardTable } from '../../../../ui/card-table/EmptyCardTable'
import { FilterTableInput } from '../../../../ui/card-table/FilterTableInput'
import { downloadAsCsv } from '../../../../utils/downloadAsCsv'
import { Flag } from '../../../VesselList/tableCells'
import { EditReporting } from '../EditReporting'

import type { MenuItem } from '../../../../types'
import type { CSSProperties, MutableRefObject } from 'react'

type ReportingListProps = {
  selectedSeaFront: MenuItem<SeaFront>
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
          ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS[selectedSeaFront.code] &&
          ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS[selectedSeaFront.code].seaFronts.includes(reporting.value.seaFront)
      ),
    [currentReportings, selectedSeaFront]
  )

  const { getTableCheckedData, renderTableHead, tableAugmentedData, tableCheckedIds, toggleTableCheckForId } = useTable<
    InfractionSuspicionReporting | PendingAlertReporting
  >(currentSeaFrontReportings, REPORTING_LIST_TABLE_OPTIONS, searchInputRef.current?.value)

  const archive = useCallback(async () => {
    if (!tableCheckedIds.length) {
      return
    }

    await dispatch(archiveReportings(tableCheckedIds.map(Number)))
  }, [dispatch, tableCheckedIds])

  const download = useCallback(() => {
    const checkedCurrentSeaFrontReportings = getTableCheckedData()
    const fileName = `${checkedCurrentSeaFrontReportings.length}-signalements-${dayjs().format('DD-MM-YYYY')}`

    downloadAsCsv(fileName, checkedCurrentSeaFrontReportings, {
      creationDate: 'Ouvert le',
      dml: 'DML concernées',
      externalReferenceNumber: 'Marquage ext.',
      flagState: 'Pavillon',
      internalReferenceNumber: 'CFR',
      ircs: 'C/S',
      reportingTitle: 'reportingTitle',
      type: {
        label: 'Origine',
        transform: getReportingOrigin
      },
      underCharter: {
        label: 'Navire sous charte ?',
        transform: reporting => (reporting.underCharter ? 'OUI' : 'NON')
      },
      'value.natinfCode': 'NATINF',
      'value.seaFront': 'Façade',
      'value.type': {
        label: 'Titre',
        transform: getReportingTitle
      },
      vesselName: 'Navire'
    })
  }, [getTableCheckedData])

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
      dispatch(showVessel(reporting, false, false))
      dispatch(getVesselVoyage(reporting, undefined, false))
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
        $hasScroll={tableAugmentedData.length > 9}
        $width={1513}
        data-cy="side-window-reporting-list"
        style={{ marginTop: 10 }}
      >
        {renderTableHead()}

        <CardTableBody>
          {tableAugmentedData.map((reporting, index) => {
            const editingIsDisabled = reporting.item.type === ReportingType.ALERT

            return (
              <CardTableRow key={reporting.id} data-cy="side-window-current-reportings" index={index + 1} style={{}}>
                <FlexboxGrid>
                  <FlexboxGrid.Item style={columnStyles[0] as CSSProperties}>
                    <StyledCheckbox
                      checked={reporting.isChecked}
                      onChange={() => toggleTableCheckForId(reporting.id)}
                    />
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item
                    style={columnStyles[1] as CSSProperties}
                    title={reporting.item.validationDate || reporting.item.creationDate}
                  >
                    {timeago.format(reporting.item.validationDate || reporting.item.creationDate, 'fr')}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item
                    style={columnStyles[2] as CSSProperties}
                    title={getReportingOrigin(reporting.item, true)}
                  >
                    {getReportingOrigin(reporting.item)}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item
                    style={columnStyles[3] as CSSProperties}
                    title={getReportingTitle(reporting.item, true)}
                  >
                    {getReportingTitle(reporting.item)}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[4] as CSSProperties}>
                    {reporting.item.value.natinfCode}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[5] as CSSProperties} title={getVesselNameTitle(reporting)}>
                    <Flag
                      rel="preload"
                      src={`${baseUrl ? `${baseUrl}/` : ''}flags/${reporting.item.flagState.toLowerCase()}.svg`}
                      style={{ marginLeft: 0, marginRight: 5, marginTop: -2, width: 18 }}
                      title={countries.getName(reporting.item.flagState.toLowerCase(), 'fr')}
                    />
                    {reporting.item.vesselName}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[6] as CSSProperties}>
                    {reporting.item.value.dml}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[7] as CSSProperties}>
                    {reporting.item.underCharter && <UnderCharter>Navire sous charte</UnderCharter>}
                  </FlexboxGrid.Item>
                  <Separator />
                  <FlexboxGrid.Item style={columnStyles[8] as CSSProperties}>
                    <IconButton
                      accent={Accent.TERTIARY}
                      data-cy="side-window-silenced-alerts-show-vessel"
                      Icon={Icon.ViewOnMap}
                      onClick={() => focusOnMap(reporting.item)}
                      style={showIconStyle}
                      title="Voir sur la carte"
                    />
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[9] as CSSProperties}>
                    <IconButton
                      accent={Accent.TERTIARY}
                      data-cy="side-window-edit-reporting"
                      disabled={editingIsDisabled}
                      Icon={Icon.Edit}
                      onClick={() => edit(editingIsDisabled, reporting.item)}
                      title="Editer le signalement"
                    />
                  </FlexboxGrid.Item>
                </FlexboxGrid>
              </CardTableRow>
            )
          })}
        </CardTableBody>
        {!tableAugmentedData.length && <EmptyCardTable>Aucun signalement</EmptyCardTable>}
      </CardTable>
      <EditReporting />
    </Content>
  )
}

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
    width: 144
  },
  {
    ...styleCenter,
    width: 176
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
    width: 176
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
