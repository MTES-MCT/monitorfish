import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { Checkbox, Table } from 'rsuite'

import { ReactComponent as FlagSVG } from '../icons/flag.svg'
import {
  CellUsingVesselProperty,
  CellWithTitle,
  CheckedCell,
  ContentWithEllipsis,
  FlagCell, StyledCheckbox,
  TimeAgoCell
} from './tableCells'
import { sortVesselsByProperty } from './tableSort'
import { COLORS } from '../../constants/constants'

import { getCoordinates } from '../../coordinates'
import { OPENLAYERS_PROJECTION } from '../../domain/entities/map/constants'

const { Column, HeaderCell, Cell } = Table

const VesselListTable = ({
  filteredVessels,
  vessels,
  allVesselsChecked,
  setAllVesselsChecked,
  vesselsCountShowed,
  vesselsCountTotal,
  seeMoreIsOpen,
  toggleSelectRow,
  filters
}) => {
  const isAdmin = useSelector(state => state.global.isAdmin)
  const { coordinatesFormat } = useSelector(state => state.map)
  const [sortColumn, setSortColumn] = React.useState()
  const [sortType, setSortType] = React.useState()

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn)
    setSortType(sortType)
  }

  const showedVessels = useMemo(() => {
    if (sortColumn && sortType) {
      return filteredVessels
        .slice()
        .sort((a, b) => sortVesselsByProperty(a, b, sortColumn, sortType))
    }

    return filteredVessels
  }, [sortColumn, sortType, filteredVessels])

  const updateAllVesselsChecked = useCallback(() => {
    const isChecked = allVesselsChecked.globalCheckbox &&
      vessels.filter(vessel => vessel.checked === true).length === vessels.length
    if (isChecked === false) {
      setAllVesselsChecked({ globalCheckbox: true })
    } else {
      setAllVesselsChecked({ globalCheckbox: !allVesselsChecked.globalCheckbox })
    }
  }, [allVesselsChecked, vessels])

  return (
    <TableContent>
      <VesselsCount data-cy={'vessel-list-table-count'}>
        {vesselsCountShowed} navires sur {vesselsCountTotal}
      </VesselsCount>
      <Table
        virtualized
        height={seeMoreIsOpen ? 480 : 530}
        rowHeight={36}
        data={showedVessels}
        sortColumn={sortColumn}
        sortType={sortType}
        onSortColumn={handleSortColumn}
        affixHorizontalScrollbar
        locale={{
          emptyMessage: 'Aucun résultat',
          loading: 'Chargement...'
        }}
      >
        <Column resizable width={35} fixed>
          <HeaderCell>
            <StyledCheckbox
              checked={allVesselsChecked.globalCheckbox && vessels.filter(vessel => vessel.checked === true).length === vessels.length}
              onChange={() => updateAllVesselsChecked()} />
          </HeaderCell>
          <CheckedCell dataKey="checked" onChange={toggleSelectRow} />
        </Column>
        {
          isAdmin
            ? <Column resizable sortable width={95} fixed>
              <HeaderCell>N. de risque</HeaderCell>
              <Cell dataKey="riskFactor">{rowData => parseFloat(rowData?.vesselProperties?.riskFactor).toFixed(1)}</Cell>
            </Column>
            : null
        }
        <Column resizable sortable width={170} fixed>
          <HeaderCell>Nom du navire</HeaderCell>
          <CellUsingVesselProperty dataKey="vesselName" vesselProperty="vesselName" />
        </Column>
        <Column resizable sortable width={100}>
          <HeaderCell>Marq. Ext.</HeaderCell>
          <CellUsingVesselProperty dataKey="externalReferenceNumber" vesselProperty="externalReferenceNumber" />
        </Column>
        <Column resizable sortable width={80}>
          <HeaderCell>Call Sign</HeaderCell>
          <CellUsingVesselProperty dataKey="ircs" vesselProperty="ircs" />
        </Column>
        <Column resizable sortable width={80}>
          <HeaderCell>MMSI</HeaderCell>
          <CellUsingVesselProperty dataKey="mmsi" vesselProperty="mmsi" />
        </Column>
        <Column resizable sortable width={120}>
          <HeaderCell>CFR</HeaderCell>
          <CellUsingVesselProperty dataKey="internalReferenceNumber" vesselProperty="internalReferenceNumber" />
        </Column>
        <Column resizable width={120}>
          <HeaderCell>Seg. flotte</HeaderCell>
          <Cell>{rowData => <ContentWithEllipsis>{rowData.vesselProperties?.fleetSegmentsArray?.join(', ')}</ContentWithEllipsis>}</Cell>
        </Column>
        <Column resizable width={120}>
          <HeaderCell>Engins à bord</HeaderCell>
          <Cell>{rowData => <ContentWithEllipsis>{rowData.vesselProperties?.gearsArray?.join(', ')}</ContentWithEllipsis>}</Cell>
        </Column>
        <Column resizable width={115}>
          <HeaderCell>Espèces à bord</HeaderCell>
          <Cell>{rowData => <ContentWithEllipsis>{rowData.vesselProperties?.speciesArray?.join(', ')}</ContentWithEllipsis>}</Cell>
        </Column>
        <Column resizable sortable width={50}>
          <HeaderCell>
            <FlagIcon />
          </HeaderCell>
          <FlagCell dataKey="flagState" vesselProperty="flagState" />
        </Column>
        <Column resizable sortable width={130}>
          <HeaderCell>Dernier signal</HeaderCell>
          <TimeAgoCell dataKey="lastPositionSentAt" />
        </Column>
        <Column resizable width={100}>
          <HeaderCell>Latitude</HeaderCell>
          <Cell>{rowData => getCoordinates(rowData.coordinates, OPENLAYERS_PROJECTION, coordinatesFormat)[0]}</Cell>
        </Column>
        <Column resizable width={110}>
          <HeaderCell>Longitude</HeaderCell>
          <Cell>{rowData => getCoordinates(rowData.coordinates, OPENLAYERS_PROJECTION, coordinatesFormat)[1]}</Cell>
        </Column>
        <Column resizable sortable width={60}>
          <HeaderCell>Cap</HeaderCell>
          <Cell dataKey="course" />
        </Column>
        <Column resizable sortable width={70}>
          <HeaderCell>Vitesse</HeaderCell>
          <Cell dataKey="speed" />
        </Column>
        <Column resizable sortable width={130}>
          <HeaderCell>Dernier contrôle</HeaderCell>
          <TimeAgoCell dataKey="lastControlDateTimeTimestamp" vesselProperty="lastControlDateTimeTimestamp" />
        </Column>
        <Column sortable width={50}>
          <HeaderCell>Infr.</HeaderCell>
          <Cell dataKey="lastControlInfraction">{rowData => rowData?.vesselProperties?.lastControlInfraction ? 'Oui' : 'Non'}</Cell>
        </Column>
        <Column resizable sortable width={300}>
          <HeaderCell>Observations</HeaderCell>
          <CellWithTitle dataKey="postControlComment" />
        </Column>
        {
          filters.districtsFiltered?.length
            ? <Column resizable sortable width={100}>
              <HeaderCell>Quartier</HeaderCell>
              <CellUsingVesselProperty dataKey="district" vesselProperty="district" />
            </Column>
            : null
        }
        {
          filters.vesselsSizeValuesChecked?.length
            ? <Column resizable sortable width={100}>
              <HeaderCell>Longueur</HeaderCell>
              <CellUsingVesselProperty dataKey="length" vesselProperty="length" />
            </Column>
            : null
        }

      </Table>
    </TableContent>
  )
}

const TableContent = styled.div`
  .rs-table-cell-header-icon-sort {
    color: ${COLORS.slateGray};
    position: absolute;
    right: 0px;
    top: 13px;
  }

  .rs-table-cell-header-icon-sort-asc::after {
    color: ${COLORS.slateGray};
  }

  .rs-table-cell-header-icon-sort-desc::after {
    color: ${COLORS.slateGray};
  }
`

const VesselsCount = styled.span`
  color: ${COLORS.slateGray};
  font-size: 13px;
  margin-bottom: 5px;
  display: inline-block;
`

const FlagIcon = styled(FlagSVG)`
  width: 20px;
  height: 20px;
  vertical-align: top;
`

export default React.memo(VesselListTable)
