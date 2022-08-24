import countries from 'i18n-iso-countries'
import React, { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { getCoordinates } from '../../../../coordinates'
import { WSG84_PROJECTION } from '../../../../domain/entities/map'
import { formatToCSVColumnsForExport, getDate } from '../../../../utils'
import { PrimaryButton } from '../../../commonStyles/Buttons.style'
import { ReactComponent as ExportSVG } from '../../../icons/Bouton_exporter_piste_navire.svg'
import { csvExporter, csvOrder } from './exportTrackOptions'

function ExportTrack() {
  const { coordinatesFormat } = useSelector(state => state.map)
  const { selectedVesselPositions } = useSelector(state => state.vessel)

  const showedPosition = useMemo(
    () =>
      selectedVesselPositions?.map(position => {
        const coordinates = getCoordinates([position.longitude, position.latitude], WSG84_PROJECTION, coordinatesFormat)

        return {
          course: position.course || '',
          externalReferenceNumber: position.externalReferenceNumber || '',
          dateTime: position.dateTime || '',
          flagState: position.flagState ? countries.getName(position.flagState.toLowerCase(), 'fr').toString() : '',
          internalReferenceNumber: position.internalReferenceNumber || '',
          ircs: position.ircs || '',
          latitude: coordinates[0] || '',
          vesselName: position.vesselName || '',
          longitude: coordinates[1] || '',
          speed: position.speed || '',
          mmsi: position.mmsi || '',
        }
      }) || [],
    [selectedVesselPositions, coordinatesFormat],
  )

  const downloadCSV = useCallback(positions => {
    if (positions?.length) {
      const objectsToExports = positions.map(position => formatToCSVColumnsForExport(position, csvOrder))

      const identifier = positions[0].internalReferenceNumber ? positions[0].internalReferenceNumber : positions[0].ircs
      const date = new Date()
      csvExporter.options.filename = `export_${identifier}_vms_${getDate(date.toISOString())}_${
        Math.floor(Math.random() * 100) + 1
      }`
      csvExporter.generateCsv(objectsToExports)
    }
  }, [])

  return (
    <ExportTrackButton
      isClickable={showedPosition?.length}
      onClick={() => downloadCSV(showedPosition)}
      title="Exporter la piste"
    >
      <ExportIcon />
      <StyledText>Exporter la piste</StyledText>
    </ExportTrackButton>
  )
}

const StyledText = styled.span`
  line-height: 20px;
  vertical-align: top;
`

const ExportTrackButton = styled(PrimaryButton)`
  cursor: ${props => (props.isClickable ? 'pointer' : 'not-allowed')};
  margin: 0 0 15px 20px;
  padding: 5px 10px 5px 5px;
  text-align: left;

  :hover,
  :focus {
    background: ${COLORS.charcoal};
  }
`

const ExportIcon = styled(ExportSVG)`
  width: 23px;
  height: 23px;
`

export default ExportTrack
