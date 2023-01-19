import countries from 'i18n-iso-countries'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { CSV_ORDER } from './constants'
import { exportToCsv } from './utils'
import { getCoordinates } from '../../../../coordinates'
import { WSG84_PROJECTION } from '../../../../domain/entities/map/constants'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { formatToCSVColumnsForExport, getDate } from '../../../../utils'
import { PrimaryButton } from '../../../commonStyles/Buttons.style'
import { ReactComponent as ExportSVG } from '../../../icons/Bouton_exporter_piste_navire.svg'

export function ExportTrack() {
  const { coordinatesFormat } = useAppSelector(state => state.map)
  const { selectedVesselPositions } = useAppSelector(state => state.vessel)

  const showedPosition = useMemo(
    () =>
      selectedVesselPositions?.map(position => {
        const coordinates = getCoordinates([position.longitude, position.latitude], WSG84_PROJECTION, coordinatesFormat)

        return {
          course: position.course || '',
          dateTime: position.dateTime || '',
          externalReferenceNumber: position.externalReferenceNumber || '',
          flagState: position.flagState ? countries.getName(position.flagState.toLowerCase(), 'fr').toString() : '',
          internalReferenceNumber: position.internalReferenceNumber || '',
          ircs: position.ircs || '',
          latitude: coordinates[0] || '',
          longitude: coordinates[1] || '',
          mmsi: position.mmsi || '',
          speed: position.speed || '',
          vesselName: position.vesselName || ''
        }
      }) || [],
    [selectedVesselPositions, coordinatesFormat]
  )

  const downloadCSV = useCallback(positions => {
    if (positions?.length) {
      const objectsToExports = positions.map(position => formatToCSVColumnsForExport(position, CSV_ORDER))

      const identifier = positions[0].internalReferenceNumber ? positions[0].internalReferenceNumber : positions[0].ircs
      const date = new Date()
      exportToCsv.options.filename = `export_${identifier}_vms_${getDate(date.toISOString())}_${
        Math.floor(Math.random() * 100) + 1
      }`
      exportToCsv.generateCsv(objectsToExports)
    }
  }, [])

  return (
    <ExportTrackButton
      isClickable={Boolean(showedPosition?.length)}
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

const ExportTrackButton = styled(PrimaryButton)<{
  isClickable: boolean
}>`
  align-self: flex-start;
  cursor: ${p => (p.isClickable ? 'pointer' : 'not-allowed')};
  margin: 0;
  padding: 0.25rem 0.5rem 0.5rem 0.25rem;
  text-align: left;

  :hover,
  :focus {
    background: ${p => p.theme.color.charcoal};
  }
`

const ExportIcon = styled(ExportSVG)`
  height: 1.5rem;
  margin-right: 0.25rem;
  width: 1.5rem;
`
