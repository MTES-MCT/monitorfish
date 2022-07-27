import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { sortArrayByColumn, SortType } from '../../vessel_list/tableSort'
import { Flag } from '../../vessel_list/tableCells'
import { useDispatch, useSelector } from 'react-redux'
import { FlexboxGrid } from 'rsuite'
import countries from 'i18n-iso-countries'
import { AlertsMenuSeaFrontsToSeaFrontList, getAlertNameFromType } from '../../../domain/entities/alerts'
import showVessel from '../../../domain/use_cases/vessel/showVessel'
import getVesselVoyage from '../../../domain/use_cases/vessel/getVesselVoyage'
import { getDateDiffInDays, getTextForSearch } from '../../../utils'
import * as timeago from 'timeago.js'
import reactivateSilencedAlert from '../../../domain/use_cases/alert/reactivateSilencedAlert'
import FilterTableInput from '../../card-table/FilterTableInput'
import CardTable from '../../card-table/CardTable'
import CardTableRow from '../../card-table/CardTableRow'
import EmptyCardTable from '../../card-table/EmptyCardTable'
import CardTableBody from '../../card-table/CardTableBody'
import CardTableHeader from '../../card-table/CardTableHeader'
import { ReportingType } from '../../../domain/entities/reporting'

const ReportingList = ({ seaFront }) => {
  const dispatch = useDispatch()
  const {
    currentReportings
  } = useSelector(state => state.reporting)
  const baseUrl = window.location.origin
  const [sortColumn] = useState('validationDateTimestamp')
  const [sortType] = useState(SortType.ASC)
  const [searched, setSearched] = useState(undefined)

  const currentSeaFrontReportings = useMemo(() => {
    return currentReportings
      .filter(reporting =>
        (AlertsMenuSeaFrontsToSeaFrontList[seaFront.code]?.seaFronts || []).includes(reporting.value.seaFront))
  }, [currentReportings, seaFront])

  const filteredReportings = useMemo(() => {
    if (!searched?.length || searched?.length <= 1) {
      return currentSeaFrontReportings
    }

    return currentSeaFrontReportings.filter(reporting =>
      getTextForSearch(reporting.vesselName).includes(getTextForSearch(searched)) ||
      getTextForSearch(reporting.internalReferenceNumber).includes(getTextForSearch(searched)) ||
      getTextForSearch(reporting.externalReferenceNumber).includes(getTextForSearch(searched)) ||
      getTextForSearch(reporting.ircs).includes(getTextForSearch(searched)))
  }, [currentSeaFrontReportings, searched])

  const sortedReportings = useMemo(() => {
    return filteredReportings
      .slice()
      .sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))
  }, [filteredReportings, sortColumn, sortType])

  return <Content>
    <FilterTableInput
      data-cy={'side-window-reporting-search'}
      baseUrl={baseUrl}
      placeholder={'Rechercher un signalement'}
      type="text"
      value={searched}
      onChange={e => setSearched(e.target.value)}
    />
      <CardTable
        data-cy={'side-window-reporting-list'}
        hasScroll={filteredReportings.length > 9}
        width={1513}
        style={{ marginTop: 10 }}
      >
        <CardTableHeader>
          <FlexboxGrid>
            <FlexboxGrid.Item style={columnStyles[0]}>
              Ouvert il y a...
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={columnStyles[1]}>
              Origine
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={columnStyles[2]}>
              Titre
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={columnStyles[3]}>
              NATINF
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={columnStyles[4]}>
              Navire
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={columnStyles[5]}>
              DML concernées
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </CardTableHeader>
        <CardTableBody>
          {sortedReportings.map((reporting, index) => (
            <CardTableRow
              key={reporting.id}
              index={index + 1}
            >
              <FlexboxGrid>
                <FlexboxGrid.Item style={columnStyles[0]}>
                  {
                    reporting.silencedAfterDate
                      ? new Date(reporting.silencedAfterDate) > new Date()
                        ? `${getDateDiffInDays(new Date(reporting.silencedAfterDate), new Date(reporting.silencedBeforeDate))} jours`
                        : timeago.format(reporting.silencedBeforeDate, 'fr')
                      : timeago.format(reporting.silencedBeforeDate, 'fr')
                  }
                </FlexboxGrid.Item>
                <FlexboxGrid.Item style={columnStyles[1]}>
                  {ReportingType[reporting.type].name}
                </FlexboxGrid.Item>
                <FlexboxGrid.Item style={columnStyles[2]}>
                  {getAlertNameFromType(reporting.value.type)}
                </FlexboxGrid.Item>
                <FlexboxGrid.Item style={columnStyles[3]}>
                  {reporting.value.natinfCode}
                </FlexboxGrid.Item>
                <FlexboxGrid.Item style={columnStyles[4]}>
                  <Flag
                    title={countries.getName(reporting.value.flagState.toLowerCase(), 'fr')}
                    rel="preload"
                    src={`${baseUrl ? `${baseUrl}/` : ''}flags/${reporting.value.flagState.toLowerCase()}.svg`}
                    style={{ width: 18, marginRight: 5, marginLeft: 0, marginTop: 1 }}
                  />
                  {reporting.vesselName}
                </FlexboxGrid.Item>
                <FlexboxGrid.Item style={columnStyles[5]}>
                  DMLs
                </FlexboxGrid.Item>
                <FlexboxGrid.Item style={columnStyles[6]}>
                  <Icon
                    data-cy={'side-window-silenced-alerts-show-vessel'}
                    style={showIconStyle}
                    alt={'Voir sur la carte'}
                    title={'Voir sur la carte'}
                    onClick={() => {
                      const vesselIdentity = { ...reporting }
                      dispatch(showVessel(vesselIdentity, false, false, null))
                      dispatch(getVesselVoyage(vesselIdentity, null, false))
                    }}
                    src={`${baseUrl}/Icone_voir_sur_la_carte.png`}
                  />
                </FlexboxGrid.Item>
                <FlexboxGrid.Item style={columnStyles[7]}>
                  <Icon
                    data-cy={'side-window-silenced-alerts-delete-silenced-alert'}
                    style={deleteSilencedAlertIconStyle}
                    alt={'Réactiver l\'alerte'}
                    title={'Réactiver l\'alerte'}
                    onClick={() => dispatch(reactivateSilencedAlert(reporting.id))}
                    src={`${baseUrl}/Icone_alertes_gris.png`}
                  />
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </CardTableRow>
          ))}
        </CardTableBody>
        {
          !sortedReportings?.length &&
          <EmptyCardTable>Aucun signalement</EmptyCardTable>
        }
    </CardTable>
  </Content>
}

const styleCenter = {
  display: 'flex',
  alignItems: 'center',
  height: 15
}

const columnStyles = [
  {
    ...styleCenter,
    width: 160,
    marginLeft: 46
  },
  {
    ...styleCenter,
    width: 180
  },
  {
    ...styleCenter,
    width: 300
  },
  {
    ...styleCenter,
    width: 150
  },
  {
    ...styleCenter,
    width: 230
  },
  {
    ...styleCenter,
    width: 250
  },
  {
    ...styleCenter,
    marginLeft: 10,
    width: 30
  },
  {
    ...styleCenter,
    marginLeft: 10,
    width: 30
  }
]

const Content = styled.div`
  width: fit-content;
  padding: 30px 40px 40px 10px;
  margin-top: 20px;
  margin-bottom: 20px;
`

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const showIconStyle = {
  width: 20,
  paddingRight: 7,
  float: 'right',
  flexShrink: 0,
  cursor: 'pointer',
  marginLeft: 'auto',
  height: 16
}

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const Icon = styled.img``
const deleteSilencedAlertIconStyle = {
  paddingRight: 10,
  float: 'right',
  flexShrink: 0,
  cursor: 'pointer',
  marginLeft: 'auto',
  height: 18
}

export default ReportingList
