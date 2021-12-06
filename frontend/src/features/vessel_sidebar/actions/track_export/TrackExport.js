import React, { useEffect, useState } from 'react'
import { COLORS } from '../../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as ExportSVG } from '../../../icons/Bouton_exporter_piste_navire.svg'
import { ExportToCsv } from 'export-to-csv'
import countries from 'i18n-iso-countries'
import { formatToCSVColumnsForExport, getDate } from '../../../../utils'
import { getCoordinates } from '../../../../coordinates'
import { WSG84_PROJECTION } from '../../../../domain/entities/map'
import { MapButtonStyle } from '../../../commonStyles/MapButton.style'
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

const TrackExport = ({ openBox, rightMenuIsOpen }) => {
  const { coordinatesFormat } = useSelector(state => state.map)
  const [positions, setPositions] = useState([])
  const { healthcheckTextWarning } = useSelector(state => state.global)
  const { selectedVesselPositions } = useSelector(state => state.vessel)

  useEffect(() => {
    if (selectedVesselPositions?.length) {
      const nextPositions = selectedVesselPositions.map(position => {
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
  }, [selectedVesselPositions, coordinatesFormat])

  const download = () => {
    const objectsToExports = positions
      .map(position => {
        return formatToCSVColumnsForExport(position, options)
      })

    const identifier = positions[0].internalReferenceNumber ? positions[0].internalReferenceNumber : positions[0].ircs
    const date = new Date()
    csvExporter.options.filename = `export_${identifier}_vms_${getDate(date.toISOString())}_${Math.floor(Math.random() * 100) + 1}`
    csvExporter.generateCsv(objectsToExports)
  }

  return (
    <TrackExportButton
      title={'Exporter la piste'}
      healthcheckTextWarning={healthcheckTextWarning}
      isClickable={selectedVesselPositions?.length}
      openBox={openBox}
      rightMenuIsOpen={rightMenuIsOpen}
      onClick={() => selectedVesselPositions?.length ? download() : undefined}
    >
      <ExportIcon/>
    </TrackExportButton>
  )
}

const TrackExportButton = styled(MapButtonStyle)`
  top: 258px;
  height: 30px;
  width: 30px;
  background: ${COLORS.charcoal};
  position: absolute;
  margin-right: ${props => props.openBox ? 505 : -45}px;
  opacity: ${props => props.openBox ? 1 : 0};
  ${props => props.isClickable ? 'cursor: pointer;' : null}
  border-radius: 1px;
  z-index: 999;
  right: ${props => props.rightMenuIsOpen && props.openBox ? 55 : 10}px;
  transition: all 0.5s, right 0.3s;

  :hover, :focus {
      background: ${COLORS.charcoal};
  }
`

const ExportIcon = styled(ExportSVG)`
  width: 30px;
`

export default TrackExport
