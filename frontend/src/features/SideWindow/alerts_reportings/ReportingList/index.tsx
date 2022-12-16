import { Icon, IconButton } from '@mtes-mct/monitor-ui'
import dayjs from 'dayjs'
import countries from 'i18n-iso-countries'
import { useCallback, useMemo, useRef } from 'react'
import { Checkbox, FlexboxGrid } from 'rsuite'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS, SeaFront } from '../../../../domain/entities/alerts/constants'
import { setEditedReportingInSideWindow } from '../../../../domain/shared_slices/Reporting'
import { InfractionSuspicionReporting, PendingAlertReporting, ReportingType } from '../../../../domain/types/reporting'
import archiveReportings from '../../../../domain/use_cases/reporting/archiveReportings'
import deleteReportings from '../../../../domain/use_cases/reporting/deleteReportings'
import { getVesselVoyage } from '../../../../domain/use_cases/vessel/getVesselVoyage'
import { showVessel } from '../../../../domain/use_cases/vessel/showVessel'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { useForceUpdate } from '../../../../hooks/useForceUpdate'
import { useTable } from '../../../../hooks/useTable'
import { CardTable } from '../../../../ui/card-table/CardTable'
import { CardTableBody } from '../../../../ui/card-table/CardTableBody'
import { CardTableFilters } from '../../../../ui/card-table/CardTableFilters'
import { CardTableRow } from '../../../../ui/card-table/CardTableRow'
import { EmptyCardTable } from '../../../../ui/card-table/EmptyCardTable'
import { FilterTableInput } from '../../../../ui/card-table/FilterTableInput'
import { RowVerticalSeparator } from '../../../../ui/card-table/RowVerticalSeparator'
import { downloadAsCsv } from '../../../../utils/downloadAsCsv'
import { ReactComponent as ArchiveIcon } from '../../../icons/Bouton_archiver.svg'
import { ReactComponent as DeleteIcon } from '../../../icons/Bouton_supprimer.svg'
// import { ReactComponent as DownloadIcon } from '../../../icons/standardized/Download.svg'
import { Flag } from '../../../vessel_list/tableCells'
import { EditReporting } from '../EditReporting'
import { REPORTING_LIST_TABLE_OPTIONS } from './constants'
import { getReportingOrigin, getReportingTitle } from './utils'

import type { MenuItem } from '../../../../types'
import type { CSSProperties, MutableRefObject } from 'react'

type ReportingListProps = {
  selectedSeaFront: MenuItem<SeaFront>
}
export function ReportingList({ selectedSeaFront }: ReportingListProps) {
  const searchInputRef = useRef() as MutableRefObject<HTMLInputElement>
  const dispatch = useAppDispatch()
  const { currentReportings } = useAppSelector(state => state.reporting)
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

    await dispatch(archiveReportings(tableCheckedIds.map(Number)) as any)
  }, [dispatch, tableCheckedIds])

  const download = useCallback(() => {
    const checkedCurrentSeaFrontReportings = getTableCheckedData()
    const fileName = `${checkedCurrentSeaFrontReportings.length}-signalements-${dayjs().format('DD-MM-YYYY')}`

    downloadAsCsv(fileName, checkedCurrentSeaFrontReportings, {
      creationDate: 'Ouvert le',
      dml: 'DML concernées',
      externalReferenceNumber: 'Marquage ext.',
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
      'value.flagState': 'Pavillon',
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
      const vesselIdentity = {
        ...reporting,
        flagState: reporting.value.flagState
      }

      dispatch(showVessel(vesselIdentity, false, false) as any)
      dispatch(getVesselVoyage(vesselIdentity, undefined, false) as any)
    },
    [dispatch]
  )

  const remove = useCallback(async () => {
    if (!tableCheckedIds.length) {
      return
    }

    await dispatch(deleteReportings(tableCheckedIds.map(Number)) as any)
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
          <ArchiveButton
            $isShowed={tableCheckedIds.length > 0}
            data-cy="archive-reporting-cards"
            onClick={archive}
            title={`Archiver ${tableCheckedIds.length} signalement${tableCheckedIds.length > 1 ? 's' : ''}`}
          />
          <DeleteButton
            $isShowed={tableCheckedIds.length > 0}
            data-cy="delete-reporting-cards"
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
              <CardTableRow key={reporting.id} data-cy="side-window-current-reportings" index={index + 1}>
                <FlexboxGrid>
                  <FlexboxGrid.Item style={columnStyles[0]}>
                    <StyledCheckbox
                      checked={reporting.isChecked}
                      onChange={() => toggleTableCheckForId(reporting.id)}
                    />
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[1]} title={reporting.item.validationDate}>
                    {timeago.format(reporting.item.validationDate, 'fr')}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[2]} title={getReportingOrigin(reporting.item, true)}>
                    {getReportingOrigin(reporting.item)}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[3]} title={getReportingTitle(reporting.item, true)}>
                    {getReportingTitle(reporting.item)}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[4]}>{reporting.item.value.natinfCode}</FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[5]} title={getVesselNameTitle(reporting)}>
                    <Flag
                      rel="preload"
                      src={`${baseUrl ? `${baseUrl}/` : ''}flags/${reporting.item.value.flagState?.toLowerCase()}.svg`}
                      style={{ marginLeft: 0, marginRight: 5, marginTop: -2, width: 18 }}
                      title={countries.getName(reporting.item.value.flagState?.toLowerCase(), 'fr')}
                    />
                    {reporting.item.vesselName}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[6]}>{reporting.item.value.dml}</FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[7]}>
                    {reporting.item.underCharter && <UnderCharter>Navire sous charte</UnderCharter>}
                  </FlexboxGrid.Item>
                  <RowVerticalSeparator />
                  <FlexboxGrid.Item style={columnStyles[8]}>
                    <LEGACY_Icon
                      alt="Voir sur la carte"
                      data-cy="side-window-silenced-alerts-show-vessel"
                      onClick={() => focusOnMap(reporting.item)}
                      src={`${baseUrl}/Icone_voir_sur_la_carte.png`}
                      style={showIconStyle}
                      title="Voir sur la carte"
                    />
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={columnStyles[9]}>
                    <LEGACY_Icon
                      alt="Editer le signalement"
                      data-cy="side-window-edit-reporting"
                      onClick={() => edit(editingIsDisabled, reporting.item)}
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
  margin-left: auto;
  align-self: flex-end;

  > button:not(:last-child) {
    margin-right: 10px;
  }
`

// TODO Move that into the UI using `<IconButton />`.
const ArchiveButton = styled(ArchiveIcon)<{
  $isShowed?: boolean
}>`
  border: 1px solid ${p => p.theme.color.lightGray};
  padding: 6.5px 6px;
  cursor: ${p => (p.$isShowed ? 'pointer' : 'not-allowed')};
  vertical-align: bottom;
  margin-right: 10px;
`

// TODO Move that into the UI using `<IconButton />`.
const DeleteButton = styled(DeleteIcon)<{
  $isShowed?: boolean
}>`
  border: 1px solid ${p => p.theme.color.lightGray};
  padding: 7px;
  cursor: ${p => (p.$isShowed ? 'pointer' : 'not-allowed')};
  vertical-align: bottom;
`

const styleCenter = {
  alignItems: 'center',
  display: 'flex',
  height: 15
}

// TODO Most of these styles are either repetitions or generalizable styles (i.e. ellipsis).
// It's  better to create common pre-styled components covering 70-80% of the cases and custom-wrapped ones
// for the rest. But not via a "detached" collections of style objects, preferably using named components.
// TODO We should really check if applying styles to a real table would not save a lot of code.
// Duplication of styles between heads and rows doesn't seem optimal.
const columnStyles: CSSProperties[] = [
  {
    ...styleCenter,
    paddingRight: 10,
    width: 36
  },
  {
    ...styleCenter,
    paddingRight: 10,
    width: '9rem'
  },
  {
    ...styleCenter,
    paddingRight: 10,
    width: '11rem'
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
    width: '18rem'
  },
  {
    ...styleCenter,
    paddingRight: 10,
    width: '9rem'
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
    width: '14rem'
  },
  {
    ...styleCenter,
    paddingRight: 10,
    width: '11rem'
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
    width: '2rem'
  },
  {
    ...styleCenter,
    marginLeft: 10,
    paddingRight: 10,
    width: '2rem'
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
// eslint-disable-next-line @typescript-eslint/naming-convention
const LEGACY_Icon = styled.img``
const editIconStyle: (disabled: boolean) => CSSProperties = (disabled: boolean) => ({
  cursor: disabled ? 'not-allowed' : 'pointer',
  flexShrink: 0,
  float: 'right',
  marginLeft: 'auto',
  paddingRight: 10
})
