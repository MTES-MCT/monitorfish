import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { sortArrayByColumn, SortType } from '../../vessel_list/tableSort'
import { Flag } from '../../vessel_list/tableCells'
import { useDispatch, useSelector } from 'react-redux'
import { Checkbox, FlexboxGrid } from 'rsuite'
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
import { getReportingOrigin } from '../../../domain/entities/reporting'
import RowVerticalSeparator from '../../card-table/RowVerticalSeparator'
import CardTableFilters from '../../card-table/CardTableFilters'
import archiveReporting from '../../../domain/use_cases/reporting/archiveReporting'
import { ReactComponent as ArchiveIconSVG } from '../../icons/Bouton_archiver.svg'
import { ReactComponent as DeleteIconSVG } from '../../icons/Bouton_supprimer.svg'
import { COLORS } from '../../../constants/constants'
import { PrimaryButton } from '../../commonStyles/Buttons.style'
import deleteReporting from '../../../domain/use_cases/reporting/deleteReporting'

const ReportingList = ({ seaFront }) => {
  const dispatch = useDispatch()
  const {
    currentReportings
  } = useSelector(state => state.reporting)
  const baseUrl = window.location.origin
  const [sortColumn] = useState('validationDateTimestamp')
  const [sortType] = useState(SortType.ASC)
  const [searched, setSearched] = useState(undefined)
  const [checkedReportingIds, setCheckedReportingIds] = useState([])

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

  const sortedAndCheckedReportings = useMemo(() => {
    return sortedReportings.map(reporting => {
      return {
        ...reporting,
        checked: checkedReportingIds.indexOf(reporting.id) !== -1
      }
    })
  }, [sortedReportings, checkedReportingIds])

  function handleSelectReporting (reportingId) {
    if (checkedReportingIds.indexOf(reportingId) !== -1) {
      setCheckedReportingIds(checkedReportingIds.filter(checkedReportingId => checkedReportingId !== reportingId))
    } else {
      setCheckedReportingIds(checkedReportingIds.concat(reportingId))
    }
  }

  return <Content>
    <CardTableFilters>
      <FilterTableInput
        data-cy={'side-window-reporting-search'}
        baseUrl={baseUrl}
        placeholder={'Rechercher un signalement'}
        type="text"
        value={searched}
        onChange={e => setSearched(e.target.value)}
      />
      <RightAligned>
        {
          checkedReportingIds.length > 0 && <>
            <ArchiveButton
              data-cy={'archive-reporting-cards'}
              title={'Archiver'}
              onClick={() => dispatch(archiveReporting(null))} // TODO archiveReportings and clean checkboxes array
            />
            <DeleteButton
              data-cy={'delete-reporting-cards'}
              title={'Supprimer'}
              onClick={() => dispatch(deleteReporting(null))} // TODO deleteReportings and clean checkboxes array
            />
          </>
        }
        <AddReportingButton
          onClick={() => console.log('add reporting')} // TODO Implement add reporting sidebar
        >
          <Plus>+</Plus> Ouvrir un signalement
        </AddReportingButton>
      </RightAligned>
    </CardTableFilters>
    <CardTable
      data-cy={'side-window-reporting-list'}
      hasScroll={filteredReportings.length > 9}
      width={1513}
      style={{ marginTop: 10 }}
    >
      <CardTableHeader>
        <FlexboxGrid>
          <FlexboxGrid.Item style={columnStyles[0]}/>
          <FlexboxGrid.Item style={columnStyles[1]}>
            Ouvert il y a...
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={columnStyles[2]}>
            Origine
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={columnStyles[3]}>
            Titre
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={columnStyles[4]}>
            NATINF
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={columnStyles[5]}>
            Navire
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={columnStyles[6]}>
            DML concernées
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </CardTableHeader>
      <CardTableBody>
        {sortedAndCheckedReportings.map((reporting, index) => (
          <CardTableRow
            key={reporting.id}
            index={index + 1}
          >
            <FlexboxGrid>
              <FlexboxGrid.Item style={columnStyles[0]}>
                <StyledCheckbox
                  checked={reporting.checked}
                  onChange={_ => handleSelectReporting(reporting.id)}
                />
              </FlexboxGrid.Item>
              <FlexboxGrid.Item style={columnStyles[1]} title={reporting.validationDate}>
                {timeago.format(reporting.validationDate, 'fr')}
              </FlexboxGrid.Item>
              <FlexboxGrid.Item style={columnStyles[2]}>
                {getReportingOrigin(reporting)}
              </FlexboxGrid.Item>
              <FlexboxGrid.Item style={columnStyles[3]}>
                {getAlertNameFromType(reporting.value.type)}
              </FlexboxGrid.Item>
              <FlexboxGrid.Item style={columnStyles[4]}>
                {reporting.value.natinfCode}
              </FlexboxGrid.Item>
              <FlexboxGrid.Item style={columnStyles[5]}>
                <Flag
                  title={countries.getName(reporting.value.flagState?.toLowerCase(), 'fr')}
                  rel="preload"
                  src={`${baseUrl ? `${baseUrl}/` : ''}flags/${reporting.value.flagState?.toLowerCase()}.svg`}
                  style={{ width: 18, marginRight: 5, marginLeft: 0, marginTop: 1 }}
                />
                {reporting.vesselName}
              </FlexboxGrid.Item>
              <FlexboxGrid.Item style={columnStyles[6]}>
                {reporting.value.dml}
              </FlexboxGrid.Item>
              <RowVerticalSeparator/>
              <FlexboxGrid.Item style={columnStyles[7]}>
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
              <FlexboxGrid.Item style={columnStyles[8]}>
                <Icon
                  data-cy={'side-window-silenced-alerts-delete-silenced-alert'}
                  style={editIconStyle}
                  alt={'Réactiver l\'alerte'}
                  title={'Réactiver l\'alerte'}
                  onClick={() => dispatch(reactivateSilencedAlert(reporting.id))}
                  src={`${baseUrl}/Bouton_edition.png`}
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

const RightAligned = styled.div`
  margin-left: auto;
  align-self: flex-end;
`

const Plus = styled.span`
  font-size: 23px;
  line-height: 0;
  margin-right: 3px;
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

const AddReportingButton = styled(PrimaryButton)`
  margin: 20px 10px 0px 0px;
`

const styleCenter = {
  display: 'flex',
  alignItems: 'center',
  height: 15
}

const columnStyles = [
  {
    ...styleCenter,
    width: 46
  },
  {
    ...styleCenter,
    width: 160
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
const editIconStyle = {
  paddingRight: 10,
  float: 'right',
  flexShrink: 0,
  cursor: 'pointer',
  marginLeft: 'auto'
}

export default ReportingList
