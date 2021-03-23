import React, {useEffect} from "react";
import styled from 'styled-components';
import * as timeago from 'timeago.js';
import {timeagoFrenchLocale} from "../utils";
import {ReactComponent as TargetSVG} from './icons/target.svg';
import {ReactComponent as FlagSVG} from './icons/flag.svg';
import Table from "rsuite/lib/Table";
import Checkbox from "rsuite/lib/Checkbox";
import countries from "i18n-iso-countries";

const { Column, HeaderCell, Cell } = Table;
timeago.register('fr', timeagoFrenchLocale);
countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));

export const TargetCell = ({ rowData, dataKey, onChange, ...props }) => {
    return (
        <Cell key={rowData.id} {...props} className={'table-content-editing'}>
            <input
                type="text"
                maxLength={3}
                className="rs-input"
                value={rowData[dataKey]}
                onChange={event => {
                    onChange && onChange(rowData.id, dataKey, parseInt(event.target.value));
                }}
            />
        </Cell>
    )
}

export const CheckedCell = ({ rowData, dataKey, onClick, onChange, ...props }) => {
    return (
        <Cell {...props} className={'table-content-editing'}>
            <Checkbox
                value={rowData[dataKey]}
                checked={rowData[dataKey]}
                onChange={value => {
                    onChange && onChange(rowData.id, dataKey, !value);
                }}
                onClick={() => {
                    onClick && onClick(rowData.id);
                }}
            />
        </Cell>
    )
}

const FlagCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props} style={{ padding: 0 }}>
        <Flag title={countries.getName(rowData[dataKey], 'fr')} rel="preload" src={`flags/${rowData[dataKey]}.svg`} />
    </Cell>
)

const TimeAgoCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
        { timeago.format(rowData[dataKey], 'fr') }
    </Cell>
)

const VesselListTable = props => {
    const [sortColumn, setSortColumn] = React.useState()
    const [sortType, setSortType] = React.useState()

    const handleSortColumn = (sortColumn, sortType) => {
        setSortColumn(sortColumn)
        setSortType(sortType)
    }

    const getVessels = () => {
        if (sortColumn && sortType) {
            return props.filteredVessels.sort((a, b) => {
                let x = a[sortColumn]
                let y = b[sortColumn]
                if (typeof x === 'string') {
                    x = x.charCodeAt()
                }
                if (typeof y === 'string') {
                    y = y.charCodeAt()
                }
                if (sortType === 'asc') {
                    return x - y
                } else {
                    return y - x
                }
            })
        }

        return props.filteredVessels
    }

    return (
        <TableContent>
            <VesselsCount>
                {props.vesselsCountShowed} navires sur {props.vesselsCountTotal}
            </VesselsCount>
            <Table
                virtualized
                height={510}
                width={1187}
                rowHeight={36}
                data={getVessels()}
                sortColumn={sortColumn}
                sortType={sortType}
                onSortColumn={handleSortColumn}
            >
                <Column width={35} fixed>
                    <HeaderCell>
                        <Checkbox
                            checked={props.allVesselsChecked.globalCheckbox && props.vessels.filter(vessel => vessel.checked === true).length === props.vessels.length}
                            onChange={() => {
                                let isChecked = props.allVesselsChecked.globalCheckbox && props.vessels.filter(vessel => vessel.checked === true).length === props.vessels.length
                                if(isChecked === false) {
                                    props.setAllVesselsChecked({globalCheckbox: true})
                                } else {
                                    props.setAllVesselsChecked({globalCheckbox: !props.allVesselsChecked.globalCheckbox})
                                }
                            }} />
                    </HeaderCell>
                    <CheckedCell dataKey="checked" onChange={props.handleChange} />
                </Column>

                <Column sortable width={50} fixed>
                    <HeaderCell>
                        <Target />
                    </HeaderCell>
                    <TargetCell dataKey="targetNumber" onChange={props.handleChange} />
                </Column>

                <Column sortable width={170} fixed>
                    <HeaderCell>Nom du navire</HeaderCell>
                    <Cell dataKey="vesselName" />
                </Column>

                <Column sortable width={100}>
                    <HeaderCell>Marq. Ext.</HeaderCell>
                    <Cell dataKey="externalReferenceNumber" />
                </Column>

                <Column sortable width={90}>
                    <HeaderCell>Call Sign</HeaderCell>
                    <Cell dataKey="ircs" />
                </Column>

                <Column sortable width={90}>
                    <HeaderCell>MMSI</HeaderCell>
                    <Cell dataKey="mmsi" />
                </Column>

                <Column sortable width={130}>
                    <HeaderCell>CFR</HeaderCell>
                    <Cell dataKey="internalReferenceNumber" />
                </Column>

                <Column sortable width={50}>
                    <HeaderCell>
                        <FlagIcon />
                    </HeaderCell>
                    <FlagCell dataKey="flagState" />
                </Column>

                <Column sortable width={130}>
                    <HeaderCell>Dernier signal</HeaderCell>
                    <TimeAgoCell dataKey="dateTimeTimestamp" />
                </Column>

                <Column width={100}>
                    <HeaderCell>Latitude</HeaderCell>
                    <Cell dataKey="latitude" />
                </Column>

                <Column width={100}>
                    <HeaderCell>Longitude</HeaderCell>
                    <Cell dataKey="longitude" />
                </Column>

                <Column sortable width={60}>
                    <HeaderCell>Cap</HeaderCell>
                    <Cell dataKey="course" />
                </Column>

                <Column sortable width={80}>
                    <HeaderCell>Vitesse</HeaderCell>
                    <Cell dataKey="speed" />
                </Column>
            </Table>
        </TableContent>
    )
}

const Flag = styled.img`
  font-size: 1.5em;
  margin-left: 14px;
  margin-top: 8px;
  display: inline-block;
  width: 1.1em;
  height: 1em;
  vertical-align: middle;
`

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

export default VesselListTable
