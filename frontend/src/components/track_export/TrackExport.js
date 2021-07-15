import React, { useEffect, useState } from 'react'
import { COLORS } from '../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as ExportSVG } from '../icons/Bouton_exporter_piste_navire.svg'
import { ExportToCsv } from 'export-to-csv'
import countries from 'i18n-iso-countries'
import { getCoordinates, getDate } from '../../utils'
import { WSG84_PROJECTION } from '../../domain/entities/map'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { useSelector } from 'react-redux'

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

// These properties are ordered for the CSV column order
const options = {
  vesselName: {
    code: 'vesselName',
    name: 'Nom'
  },
  externalReferenceNumber: {
    code: 'externalReferenceNumber',
    name: 'Marq. Ext.'
  },
  ircs: {
    code: 'ircs',
    name: 'C/S'
  },
  mmsi: {
    code: 'mmsi',
    name: 'MMSI'
  },
  internalReferenceNumber: {
    code: 'internalReferenceNumber',
    name: 'CFR'
  },
  flagState: {
    code: 'flagState',
    name: 'Pavillon'
  },
  dateTime: {
    code: 'dateTime',
    name: 'GDH (UTC)'
  },
  latitude: {
    code: 'latitude',
    name: 'Latitude'
  },
  longitude: {
    code: 'longitude',
    name: 'Longitude'
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

function orderToCSVColumnOrder (positionsObject) {
  return Object.keys(options)
    .reduce(
      (obj, key) => {
        obj[options[key].name] = positionsObject[options[key].code]
        return obj
      },
      {}
    )
}

const TrackExport = props => {
  const { coordinatesFormat } = useSelector(state => state.map)
  const [positions, setPositions] = useState([])
  const { healthcheckTextWarning } = useSelector(state => state.global)
  const { selectedVessel } = useSelector(state => state.vessel)

  useEffect(() => {
    if (selectedVessel && selectedVessel.positions && selectedVessel.positions.length) {
      const nextPositions = selectedVessel.positions.map(position => {
        const coordinates = getCoordinates([position.longitude, position.latitude], WSG84_PROJECTION, coordinatesFormat)

        return {
          vesselName: position.vesselName ? position.vesselName : '',
          course: position.course ? position.course : '',
          speed: position.speed ? position.speed : '',
          flagState: position.flagState ? countries.getName(position.flagState.toLowerCase(), 'fr').toString() : '',
          mmsi: position.mmsi ? position.mmsi : '',
          internalReferenceNumber: position.internalReferenceNumber ? position.internalReferenceNumber : '',
          externalReferenceNumber: position.externalReferenceNumber ? position.externalReferenceNumber : '',
          ircs: position.ircs ? position.ircs : '',
          dateTime: position.dateTime ? position.dateTime : '',
          latitude: coordinates[0] ? coordinates[0] : '',
          longitude: coordinates[1] ? coordinates[1] : ''
        }
      })

      setPositions(nextPositions)
    }
  }, [selectedVessel])

  const download = () => {
    const objectsToExports = positions
      .map(position => {
        return orderToCSVColumnOrder(position)
      })

    const identifier = positions[0].internalReferenceNumber ? positions[0].internalReferenceNumber : positions[0].ircs
    const date = new Date()
    csvExporter.options.filename = `export_${identifier}_vms_${getDate(date.toISOString())}_${Math.floor(Math.random() * 100) + 1}`
    csvExporter.generateCsv(objectsToExports)
  }

  return (
    <TrackExportButton
      healthcheckTextWarning={healthcheckTextWarning}
      isClickable={selectedVessel && selectedVessel.positions && selectedVessel.positions.length}
      openBox={props.openBox}
      firstUpdate={props.firstUpdate.current}
      rightMenuIsOpen={props.rightMenuIsOpen}
      onClick={() => selectedVessel && selectedVessel.positions && selectedVessel.positions.length ? download() : undefined}
    >
      <ExportIcon/>
    </TrackExportButton>
  )
}

const TrackExportButton = styled(MapButtonStyle)`
  top: 153px;
  height: 30px;
  width: 30px;
  background: ${COLORS.grayDarkerThree};
  position: absolute;
  right: 10px;
  margin-right: -45px;
  opacity: 0;
  ${props => props.isClickable ? 'cursor: pointer;' : null}
  border-radius: 1px;
  z-index: 999;
  
  animation: ${props => props.firstUpdate && !props.openBox ? '' : props.openBox ? 'vessel-track-depth-selection-button-opening' : 'vessel-track-depth-selection-button-closing'} 0.5s ease forwards,
  ${props => props.rightMenuIsOpen && props.openBox ? 'vessel-box-opening-with-right-menu-hover' : 'vessel-box-closing-with-right-menu-hover'} 0.3s ease forwards;

  @keyframes vessel-track-depth-selection-button-opening {
    0%   { margin-right: -45px; opacity: 0;   }
    100% { margin-right: 505px; opacity: 1; }
  }

  @keyframes vessel-track-depth-selection-button-closing {
    0% { margin-right: 505px; opacity: 1; }
    100%   { margin-right: -45px; opacity: 0;   }
  }
`

const ExportIcon = styled(ExportSVG)`
  width: 30px;
  background: none;
`

export default TrackExport
