import React, {useState} from "react";
import styled from "styled-components";
import Modal from "rsuite/lib/Modal";
import {COLORS} from "../constants/constants";
import Checkbox from "rsuite/lib/Checkbox";
import CheckboxGroup from "rsuite/lib/CheckboxGroup";
import {Radio} from "rsuite";
import { ExportToCsv } from 'export-to-csv';
import countries from "i18n-iso-countries";
import {getDateTime} from "../utils";

countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));

const optionsCSV = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    showTitle: false,
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
};

const csvExporter = new ExportToCsv(optionsCSV);

// These properties are ordered for the CSV column order
const options = {
    targetNumber: {
        code: 'targetNumber',
        name: 'Priorite',
    },
    vesselName: {
        code: 'vesselName',
        name: 'Nom',
    },
    externalReferenceNumber: {
        code: 'externalReferenceNumber',
        name: 'Marq. Ext.',
    },
    ircs: {
        code: 'ircs',
        name: 'C/S',
    },
    mmsi: {
        code: 'mmsi',
        name: 'MMSI',
    },
    internalReferenceNumber: {
        code: 'internalReferenceNumber',
        name: 'CFR',
    },
    flagState: {
        code: 'flagState',
        name: 'Pavillon',
    },
    dateTime: {
        code: 'dateTime',
        name: 'GDH (UTC)',
    },
    latitude: {
        code: 'latitude',
        name: 'Latitude',
    },
    longitude: {
        code: 'longitude',
        name: 'Longitude',
    },
    course: {
        code: 'course',
        name: 'Cap'
    },
    speed: {
        code: 'speed',
        name: 'Vitesse'
    }
}

function orderToCSVColumnOrder(valuesChecked, filteredVesselObject) {
    return Object.keys(options)
        .filter(value => {
            return valuesChecked.some(valueChecked => value === valueChecked)
        }).reduce(
            (obj, key) => {
                obj[options[key].name] = filteredVesselObject[options[key].name]
                return obj
            },
            {}
        )
}

const DownloadVesselListModal = props => {
    const [indeterminate, setIndeterminate] = useState(false)
    const [checkAll, setCheckAll] = useState(true)
    const [valuesChecked, setValuesChecked] = useState(Object.keys(options).map(value => options[value].code))

    const handleCheckAll = (value, checked) => {
        const nextValue = checked ? Object.keys(options).map(value => options[value].code) : [];

        setValuesChecked(nextValue)
        setIndeterminate(false)
        setCheckAll(checked)
    }
    const handleChange = value => {
        setValuesChecked(value)
        setIndeterminate(value.length > 0 && value.length < Object.keys(options).length)
        setCheckAll(value.length === options.length)
    }

    const download = () => {
        let objectsToExports = props.filteredVessels
            .filter(vessel => vessel.checked)
            .map(vessel => {
            let filteredVesselObject = {}

            valuesChecked.forEach(valueChecked => {
                switch (valueChecked) {
                    case options.dateTime.code: filteredVesselObject[options[valueChecked].name] = getDateTime(vessel[valueChecked], true); break;
                    case options.flagState.code: filteredVesselObject[options[valueChecked].name] = countries.getName(vessel[valueChecked], 'fr'); break;
                    default: filteredVesselObject[options[valueChecked].name] = vessel[valueChecked] ? vessel[valueChecked].toString() : ''
                }
            })

            return orderToCSVColumnOrder(valuesChecked, filteredVesselObject)
        })

        csvExporter.generateCsv(objectsToExports)
    }

    return (
        <Modal
            size={"sm"}
            backdrop
            show={props.isOpen}
            style={{marginTop: 100}}
            onHide={() => props.setIsOpen(false)}
        >
            <Modal.Header>
                <Modal.Title>
                    <Title>
                        Télécharger la liste des navires
                    </Title>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Description>Sélectionnez les colonnes à télécharger</Description>
                <CheckboxGroup
                    inline
                    name="checkboxList"
                    value={valuesChecked}
                    onChange={handleChange}
                >
                    <Columns>
                        <div>
                            <Checkbox value={options.targetNumber.code}>Priorité</Checkbox><br/>
                            <Checkbox value={options.vesselName.code}>Nom</Checkbox><br/>
                            <Checkbox value={options.externalReferenceNumber.code}>Marquage extérieur</Checkbox><br/>
                            <Checkbox value={options.ircs.code}>Call Sign (IRCS)</Checkbox><br/>
                            <Checkbox value={options.mmsi.code}>MMSI</Checkbox><br/>
                            <Checkbox value={options.internalReferenceNumber.code}>CFR</Checkbox><br/>
                            <Checkbox value={options.flagState.code}>Nationalité</Checkbox><br/>
                        </div>
                        <div>
                            <Checkbox value={options.dateTime.code}>Date et heure du dernier signal</Checkbox><br/>
                            <Checkbox value={options.latitude.code}>Latitude</Checkbox><br/>
                            <Checkbox value={options.longitude.code}>Longitude</Checkbox><br/>
                            <Checkbox value={options.course.code}>Cap</Checkbox><br/>
                            <Checkbox value={options.speed.code}>Vitesse</Checkbox><br/>
                        </div>
                    </Columns>

                </CheckboxGroup>
                <SelectAll>
                    <Checkbox
                        indeterminate={indeterminate}
                        checked={checkAll}
                        onChange={handleCheckAll}
                    >
                        <SelectAllText>
                            Tout sélectionner
                        </SelectAllText>
                    </Checkbox>
                </SelectAll>
                <Description>Format de fichier</Description>
                <Radio checked value="csv">csv</Radio>
            </Modal.Body>
            <Modal.Footer>
                <DownloadButton
                    onClick={() => download()}>
                    Télécharger le tableau
                </DownloadButton>
            </Modal.Footer>
        </Modal>
    );
}

const Columns = styled.div`
  display: flex;
  flex: 1 1 1;
`

const SelectAllText = styled.span`
  color: ${COLORS.textGray};
`

const SelectAll = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
  text-decoration: underline;
`

const Title = styled.div`
  font-size: 16px;
  line-height: 30px;
`

const Description = styled.div`
  font-size: 13px;
  color: ${COLORS.textGray};
`

const DownloadButton = styled.button`
  background: ${COLORS.grayDarkerThree};
  padding: 5px;
  margin: 20px 20px 20px 10px;
  font-size: 13px;
  color: ${COLORS.grayBackground};
  
  :hover {
    background: ${COLORS.grayDarkerThree};
  }
`

export default DownloadVesselListModal
