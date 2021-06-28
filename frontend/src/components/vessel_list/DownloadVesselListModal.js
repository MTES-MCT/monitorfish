import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Modal from 'rsuite/lib/Modal'
import { COLORS } from '../../constants/constants'
import Checkbox from 'rsuite/lib/Checkbox'
import CheckboxGroup from 'rsuite/lib/CheckboxGroup'
import { ExportToCsv } from 'export-to-csv'
import countries from 'i18n-iso-countries'
import { getDate } from '../../utils'
import { CSVOptions } from './dataFormatting'

countries.registerLocale(require('i18n-iso-countries/langs/fr.json'))

const optionsCSV = {
  fieldSeparator: ',',
  quoteStrings: '"',
  decimalSeparator: '.',
  showLabels: true,
  showTitle: false,
  useTextFile: false,
  useBom: true,
  useKeysAsHeaders: true
}

const csvExporter = new ExportToCsv(optionsCSV)

function orderToCSVColumnOrder (valuesChecked, filteredVesselObject) {
  return Object.keys(CSVOptions)
    .filter(value => {
      return valuesChecked.some(valueChecked => value === valueChecked)
    }).reduce(
      (obj, key) => {
        obj[CSVOptions[key].name] = filteredVesselObject[CSVOptions[key].name]
        return obj
      },
      {}
    )
}

const DownloadVesselListModal = props => {
  const [indeterminate, setIndeterminate] = useState(false)
  const [checkAll, setCheckAll] = useState(true)
  const [valuesChecked, setValuesChecked] = useState([])

  useEffect(() => {
    const columnsNotCheckedByDefault = [
      CSVOptions.species.code,
      CSVOptions.length.code,
      CSVOptions.district.code
    ]

    const values = Object.keys(CSVOptions)
      .map(value => CSVOptions[value].code)
      .filter(value => !columnsNotCheckedByDefault.includes(value))

    setValuesChecked(values || [])
  }, [])

  const handleCheckAll = (value, checked) => {
    const nextValue = checked ? Object.keys(CSVOptions).map(value => CSVOptions[value].code) : []

    setValuesChecked(nextValue)
    setIndeterminate(false)
    setCheckAll(checked)
  }
  const handleChange = value => {
    setValuesChecked(value)
    setIndeterminate(value.length > 0 && value.length < Object.keys(CSVOptions).length)
    setCheckAll(value.length === CSVOptions.length)
  }

  const download = () => {
    const objectsToExports = props.filteredVessels
      .filter(vessel => vessel.checked)
      .map(vessel => {
        const filteredVesselObject = {}

        valuesChecked.forEach(valueChecked => {
          switch (valueChecked) {
            case CSVOptions.flagState.code:
              filteredVesselObject[CSVOptions[valueChecked].name] = countries.getName(vessel[valueChecked], 'fr')
              break
            default:
              filteredVesselObject[CSVOptions[valueChecked].name] = vessel[valueChecked] ? vessel[valueChecked].toString() : ''
          }
        })

        return orderToCSVColumnOrder(valuesChecked, filteredVesselObject)
      })

    const date = new Date()
    csvExporter.options.filename = `export_vms_${getDate(date.toISOString())}_${Math.floor(Math.random() * 100) + 1}`
    csvExporter.generateCsv(objectsToExports)
  }

  return (
    <Modal
      size={'sm'}
      backdrop
      show={props.isOpen}
      style={{ marginTop: 100 }}
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
              <Checkbox value={CSVOptions.targetNumber.code}>Priorité</Checkbox><br/>
              <Checkbox value={CSVOptions.vesselName.code}>Nom</Checkbox><br/>
              <Checkbox value={CSVOptions.externalReferenceNumber.code}>Marquage extérieur</Checkbox><br/>
              <Checkbox value={CSVOptions.ircs.code}>Call Sign (IRCS)</Checkbox><br/>
              <Checkbox value={CSVOptions.mmsi.code}>MMSI</Checkbox><br/>
              <Checkbox value={CSVOptions.internalReferenceNumber.code}>CFR</Checkbox><br/>
              <Checkbox value={CSVOptions.flagState.code}>Nationalité</Checkbox><br/>
              <Checkbox value={CSVOptions.district.code}>Quartier</Checkbox><br/>
              <Checkbox value={CSVOptions.lastControlDateTime.code}>Dernier contrôle</Checkbox><br/>
              <Checkbox value={CSVOptions.lastControlInfraction.code}>Infraction</Checkbox><br/>
              <Checkbox value={CSVOptions.postControlComment.code}>Observations</Checkbox><br/>
            </div>
            <div>
              <Checkbox value={CSVOptions.dateTime.code}>Date et heure du dernier signal</Checkbox><br/>
              <Checkbox value={CSVOptions.latitude.code}>Latitude</Checkbox><br/>
              <Checkbox value={CSVOptions.longitude.code}>Longitude</Checkbox><br/>
              <Checkbox value={CSVOptions.course.code}>Cap</Checkbox><br/>
              <Checkbox value={CSVOptions.speed.code}>Vitesse</Checkbox><br/>
              <Checkbox value={CSVOptions.fleetSegments.code}>Segments de flotte</Checkbox><br/>
              <Checkbox value={CSVOptions.gears.code}>Engins à bord</Checkbox><br/>
              <Checkbox value={CSVOptions.species.code}>Espèces à bord</Checkbox><br/>
              <Checkbox value={CSVOptions.length.code}>Longueur</Checkbox><br/>
            </div>
          </Columns>
        </CheckboxGroup>
        <SelectAll>
          <Checkbox
            className={'checkbox-hidden'}
            indeterminate={indeterminate}
            checked={checkAll}
            onChange={handleCheckAll}
          >
            <SelectAllText>
              Tout {checkAll ? 'dé' : ''}sélectionner
            </SelectAllText>
          </Checkbox>
        </SelectAll>
      </Modal.Body>
      <Modal.Footer>
        <DownloadButton
          onClick={() => download()}>
          Télécharger le tableau
        </DownloadButton>
      </Modal.Footer>
    </Modal>
  )
}

const Columns = styled.div`
  display: flex;
  flex: 1 1 1;
`

const SelectAllText = styled.span`
  color: ${COLORS.textGray};
  text-decoration: underline;
  text-decoration-color: ${COLORS.textGray};
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
  padding: 5px 12px;
  margin: 20px 20px 20px 10px;
  font-size: 13px;
  color: ${COLORS.grayBackground};
  
  :hover {
    background: ${COLORS.grayDarkerThree};
  }
`

export default DownloadVesselListModal
