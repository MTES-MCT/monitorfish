import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Checkbox, CheckboxGroup, Modal } from 'rsuite'
import { COLORS } from '../../constants/constants'
import { ExportToCsv } from 'export-to-csv'
import countries from 'i18n-iso-countries'
import { formatToCSVColumnsForExport, getDate } from '../../utils'
import { CSVOptions } from './dataFormatting'
import { OPENLAYERS_PROJECTION } from '../../domain/entities/map/constants'
import { getCoordinates } from '../../coordinates'
import { useSelector } from 'react-redux'
import StyledModalHeader from '../commonComponents/StyledModalHeader'

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

const DownloadVesselListModal = ({ filteredVessels, isOpen, setIsOpen }) => {
  const { coordinatesFormat } = useSelector(state => state.map)
  const [checkboxState, setCheckboxState] = useState({
    checkAll: true,
    indeterminate: false,
    valuesChecked: []
  })

  useEffect(() => {
    const columnsNotCheckedByDefault = [
      CSVOptions.riskFactor.code,
      CSVOptions.species.code,
      CSVOptions.length.code,
      CSVOptions.externalReferenceNumber.code,
      CSVOptions.flagState.code,
      CSVOptions.fleetSegments.code,
      CSVOptions.gears.code,
      CSVOptions.lastControlDateTime.code,
      CSVOptions.lastControlInfraction.code,
      CSVOptions.postControlComment.code
    ]

    const values = Object.keys(CSVOptions)
      .map(value => CSVOptions[value].code)
      .filter(value => !columnsNotCheckedByDefault.includes(value))

    setCheckboxState((checkboxState) => ({ ...checkboxState, valuesChecked: values || [] }))
  }, [])

  const handleCheckAll = (value, checked) => {
    const nextValue = checked ? Object.keys(CSVOptions).map(value => CSVOptions[value].code) : []

    setCheckboxState(({
      checkAll: checked,
      indeterminate: false,
      valuesChecked: nextValue
    }))
  }

  const handleChange = value => {
    setCheckboxState(({
      checkAll: value.length === CSVOptions.length,
      indeterminate: value.length > 0 && value.length < Object.keys(CSVOptions).length,
      valuesChecked: value
    }))
  }

  const download = () => {
    const objectsToExports = filteredVessels
      .filter(vessel => vessel.checked)
      .map(vessel => {
        vessel.vesselProperties.latitude = getCoordinates(vessel.coordinates, OPENLAYERS_PROJECTION, coordinatesFormat)[0]
          .replace(/[ ]/g, '')
        vessel.vesselProperties.longitude = getCoordinates(vessel.coordinates, OPENLAYERS_PROJECTION, coordinatesFormat)[1]
          .replace(/[ ]/g, '')

        const filteredVesselObject = {}
        checkboxState.valuesChecked.forEach(valueChecked => {
          switch (valueChecked) {
            case CSVOptions.flagState.code:
              filteredVesselObject[CSVOptions.flagState.code] = vessel?.vesselProperties?.flagState ? countries.getName(vessel?.vesselProperties?.flagState, 'fr') : ''
              break
            default: {
              const value = vessel[valueChecked] || vessel?.vesselProperties[valueChecked] || ''
              const stringValue = Array.isArray(value) ? value.join(', ') : value.toString()
              filteredVesselObject[valueChecked] = stringValue
            }
          }
        })

        return formatToCSVColumnsForExport(filteredVesselObject, CSVOptions, checkboxState.valuesChecked)
      })

    if (objectsToExports) {
      const date = new Date()
      csvExporter.options.filename = `export_vms_${getDate(date.toISOString())}_${Math.floor(Math.random() * 100) + 1}`
      csvExporter.generateCsv(objectsToExports)
    }
  }

  return (
    <Modal
      size={'sm'}
      backdrop
      open={isOpen}
      style={{ marginTop: 100 }}
      onClose={() => setIsOpen(false)}
    >
      <StyledModalHeader>
        <Modal.Title>
          <Title>
            Télécharger la liste des navires
          </Title>
        </Modal.Title>
      </StyledModalHeader>
      <Modal.Body>
        <Description>Sélectionnez les colonnes à télécharger</Description>
        <StyledCheckboxGroup
          inline
          name="checkboxList"
          value={checkboxState.valuesChecked || []}
          onChange={handleChange}
        >
          <div>
            <Checkbox value={CSVOptions.riskFactor.code}>Note de risque</Checkbox><br/>
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
        </StyledCheckboxGroup>
        <SelectAll>
          <Checkbox
            className={'checkbox-hidden'}
            indeterminate={checkboxState.indeterminate}
            checked={checkboxState.checkAll}
            onChange={handleCheckAll}
          >
            <SelectAllText>
              Tout {checkboxState.checkAll ? 'dé' : ''}sélectionner
            </SelectAllText>
          </Checkbox>
        </SelectAll>
      </Modal.Body>
      <Modal.Footer>
        <DownloadButton
          data-cy={'download-vessels'}
          onClick={download}>
          Télécharger le tableau
        </DownloadButton>
      </Modal.Footer>
    </Modal>
  )
}

const StyledCheckboxGroup = styled(CheckboxGroup)`
  display: flex;
  flex: 1 1 1;
`

const SelectAllText = styled.span`
  color: ${COLORS.slateGray};
  text-decoration: underline;
  text-decoration-color: ${COLORS.slateGray};
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
  color: ${COLORS.slateGray};
`

const DownloadButton = styled.button`
  background: ${COLORS.charcoal};
  padding: 5px 12px;
  margin: 20px 20px 20px 10px;
  font-size: 13px;
  color: ${COLORS.gainsboro};

  :hover {
    background: ${COLORS.charcoal};
  }
`

export default DownloadVesselListModal
