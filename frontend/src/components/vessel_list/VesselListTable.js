import React, { useCallback } from 'react'
import styled from 'styled-components'
import { ReactComponent as TargetSVG } from '../icons/target.svg'
import { ReactComponent as FlagSVG } from '../icons/flag.svg'
import Table from 'rsuite/lib/Table'
import Checkbox from 'rsuite/lib/Checkbox'
import { CellWithTitle, CheckedCell, EllipsisCell, FlagCell, TargetCell, TimeAgoCell } from './tableCells'
import countries from 'i18n-iso-countries'
import { CSVOptions } from './dataFormatting'

const { Column, HeaderCell, Cell } = Table

const VesselListTable = props => {
  const [sortColumn, setSortColumn] = React.useState()
  const [sortType, setSortType] = React.useState()

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn)
    setSortType(sortType)
  }

  const getVessels = useCallback(() => {
    if (sortColumn && sortType) {
      return props.filteredVessels
        .slice()
        .sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))
    }

    return props.filteredVessels
  }, [sortColumn, sortType, props.filteredVessels])

  function sortArrayByColumn (a, b, sortColumn, sortType) {
    let x = a[sortColumn]
    let y = b[sortColumn]

    if (sortColumn === CSVOptions.flagState.code) {
      x = countries.getName(a[sortColumn], 'fr')
      y = countries.getName(b[sortColumn], 'fr')
    }

    if (typeof x === 'string' && typeof y === 'string') {
      x = x.charCodeAt()
      y = y.charCodeAt()
    }

    if (x === '') {
      return 1
    }
    if (y === '') {
      return -1
    }

    if (sortType === 'asc') {
      return x - y
    } else {
      return y - x
    }
  }

  const updateAllVesselsChecked = useCallback(() => {
    const isChecked = props.allVesselsChecked.globalCheckbox && props.vessels.filter(vessel => vessel.checked === true).length === props.vessels.length
    if (isChecked === false) {
      props.setAllVesselsChecked({ globalCheckbox: true })
    } else {
      props.setAllVesselsChecked({ globalCheckbox: !props.allVesselsChecked.globalCheckbox })
    }
  }, [props.allVesselsChecked, props.vessels])

  return (
    <TableContent>
      <VesselsCount>
        {props.vesselsCountShowed} navires sur {props.vesselsCountTotal}
      </VesselsCount>
      <Table
        virtualized
        height={props.seeMoreIsOpen ? 480 : 530}
        rowHeight={36}
        data={getVessels()}
        sortColumn={sortColumn}
        sortType={sortType}
        onSortColumn={handleSortColumn}
        affixHorizontalScrollbar
      >
        <Column resizable width={35} fixed>
          <HeaderCell>
            <Checkbox
              checked={props.allVesselsChecked.globalCheckbox && props.vessels.filter(vessel => vessel.checked === true).length === props.vessels.length}
              onChange={() => updateAllVesselsChecked()}/>
          </HeaderCell>
          <CheckedCell dataKey="checked" onChange={props.handleChange}/>
        </Column>
        <Column resizable sortable width={50} fixed>
          <HeaderCell>
            <Target/>
          </HeaderCell>
          <TargetCell dataKey="targetNumber" onChange={props.handleChange}/>
        </Column>
        <Column resizable sortable width={170} fixed>
          <HeaderCell>Nom du navire</HeaderCell>
          <Cell dataKey="vesselName"/>
        </Column>
        <Column resizable sortable width={100}>
          <HeaderCell>Marq. Ext.</HeaderCell>
          <Cell dataKey="externalReferenceNumber"/>
        </Column>
        <Column resizable sortable width={80}>
          <HeaderCell>Call Sign</HeaderCell>
          <Cell dataKey="ircs"/>
        </Column>
        <Column resizable sortable width={80}>
          <HeaderCell>MMSI</HeaderCell>
          <Cell dataKey="mmsi"/>
        </Column>
        <Column resizable sortable width={120}>
          <HeaderCell>CFR</HeaderCell>
          <Cell dataKey="internalReferenceNumber"/>
        </Column>
        <Column resizable width={120}>
          <HeaderCell>Seg. flotte</HeaderCell>
          <EllipsisCell dataKey="fleetSegments"/>
        </Column>
        <Column resizable width={120}>
          <HeaderCell>Engins à bord</HeaderCell>
          <EllipsisCell dataKey="gears"/>
        </Column>
        <Column resizable width={115}>
          <HeaderCell>Espèces à bord</HeaderCell>
          <EllipsisCell dataKey="species"/>
        </Column>
        <Column resizable sortable width={50}>
          <HeaderCell>
            <FlagIcon/>
          </HeaderCell>
          <FlagCell dataKey="flagState"/>
        </Column>
        <Column resizable sortable width={130}>
          <HeaderCell>Dernier signal</HeaderCell>
          <TimeAgoCell dataKey="dateTimeTimestamp"/>
        </Column>
        <Column resizable width={100}>
          <HeaderCell>Latitude</HeaderCell>
          <Cell dataKey="latitude"/>
        </Column>
        <Column resizable width={110}>
          <HeaderCell>Longitude</HeaderCell>
          <Cell dataKey="longitude"/>
        </Column>
        <Column resizable sortable width={60}>
          <HeaderCell>Cap</HeaderCell>
          <Cell dataKey="course"/>
        </Column>
        <Column resizable sortable width={70}>
          <HeaderCell>Vitesse</HeaderCell>
          <Cell dataKey="speed"/>
        </Column>
        <Column resizable sortable width={130}>
          <HeaderCell>Dernier contrôle</HeaderCell>
          <TimeAgoCell dataKey="lastControlDateTimeTimestamp"/>
        </Column>
        <Column sortable width={50}>
          <HeaderCell>Infr.</HeaderCell>
          <Cell dataKey="lastControlInfraction"/>
        </Column>
        <Column resizable sortable width={300}>
          <HeaderCell>Observations</HeaderCell>
          <CellWithTitle dataKey="postControlComment"/>
        </Column>
        {
          props.filters.districtsFiltered && props.filters.districtsFiltered.length
            ? <Column resizable sortable width={100}>
              <HeaderCell>Quartier</HeaderCell>
              <Cell dataKey="district"/>
            </Column>
            : null
        }
        {
          props.filters.vesselsSizeValuesChecked && props.filters.vesselsSizeValuesChecked.length
            ? <Column resizable sortable width={100}>
              <HeaderCell>Longueur</HeaderCell>
              <Cell dataKey="length"/>
            </Column>
            : null
        }

      </Table>
    </TableContent>
  )
}

const TableContent = styled.div``

const VesselsCount = styled.span`
  color: #969696;
  font-size: 13px;
  margin-bottom: 5px;
  display: inline-block;
`

const Target = styled(TargetSVG)`
  width: 20px;
  height: 20px;
  vertical-align: top;
`

const FlagIcon = styled(FlagSVG)`
  width: 20px;
  height: 20px;
  vertical-align: top;
`

export default React.memo(VesselListTable)
