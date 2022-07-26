import React, { useCallback, useMemo } from 'react'
import { COLORS } from '../../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as ExportSVG } from '../../../icons/Bouton_exporter_piste_navire.svg'
import countries from 'i18n-iso-countries'
import { formatToCSVColumnsForExport, getDate } from '../../../../utils'
import { getCoordinates } from '../../../../coordinates'
import { WSG84_PROJECTION } from '../../../../domain/entities/map'
import { useSelector } from 'react-redux'
import { csvExporter, csvOrder } from './exportTrackOptions'
import { PrimaryButton } from '../../../commonStyles/Buttons.style'

const ExportTrack = () => {
  const { coordinatesFormat } = useSelector(state => state.map)
  const { selectedVesselPositions } = useSelector(state => state.vessel)

  const showedPosition = useMemo(() => {
    return selectedVesselPositions?.map(position => {
      const coordinates = getCoordinates([position.longitude, position.latitude], WSG84_PROJECTION, coordinatesFormat)

      return {
        vesselName: position.vesselName || '',
        course: position.course || '',
        speed: position.speed || '',
        flagState: position.flagState ? countries.getName(position.flagState.toLowerCase(), 'fr').toString() : '',
        mmsi: position.mmsi || '',
        internalReferenceNumber: position.internalReferenceNumber || '',
        externalReferenceNumber: position.externalReferenceNumber || '',
        ircs: position.ircs || '',
        dateTime: position.dateTime || '',
        latitude: coordinates[0] || '',
        longitude: coordinates[1] || ''
      }
    }) || []
  }, [selectedVesselPositions, coordinatesFormat])

  const downloadCSV = useCallback(positions => {
    if (positions?.length) {
      const objectsToExports = positions
        .map(position => {
          return formatToCSVColumnsForExport(position, csvOrder)
        })

      const identifier = positions[0].internalReferenceNumber ? positions[0].internalReferenceNumber : positions[0].ircs
      const date = new Date()
      csvExporter.options.filename = `export_${identifier}_vms_${getDate(date.toISOString())}_${Math.floor(Math.random() * 100) + 1}`
      csvExporter.generateCsv(objectsToExports)
    }
  }, [])

  return (
    <ExportTrackButton
      title={'Exporter la piste'}
      isClickable={showedPosition?.length}
      onClick={() => downloadCSV(showedPosition)}
    >
      <ExportIcon/>
      <StyledText>Exporter la piste</StyledText>
    </ExportTrackButton>
  )
}

const StyledText = styled.span`
  line-height: 20px;
  vertical-align: top;
`

const ExportTrackButton = styled(PrimaryButton)`
  cursor: ${props => props.isClickable ? 'pointer' : 'not-allowed'};
  margin: 0 0 15px 20px;
  padding: 5px 10px 5px 5px;
  text-align: left;

  :hover, :focus {
      background: ${COLORS.charcoal};
  }
`

const ExportIcon = styled(ExportSVG)`
  width: 23px;
  height: 23px;
`

export default ExportTrack
