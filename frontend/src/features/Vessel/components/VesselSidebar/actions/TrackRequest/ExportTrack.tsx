import { WSG84_PROJECTION } from '@features/Map/constants'
import { Vessel } from '@features/Vessel/Vessel.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useTracking } from '@hooks/useTracking'
import { downloadAsCsv } from '@utils/downloadAsCsv'
import { getCoordinates } from 'coordinates'
import dayjs from 'dayjs'
import countries from 'i18n-iso-countries'
import { useCallback } from 'react'
import styled from 'styled-components'
import { getDate } from 'utils'

import { PrimaryButton } from '../../../../../commonStyles/Buttons.style'
import ExportSVG from '../../../../../icons/Bouton_exporter_piste_navire.svg?react'

import type { DownloadAsCsvMap } from '@utils/downloadAsCsv'

type VesselPositionWithId = Vessel.VesselPosition & {
  id: string
  latitude: string
  longitude: string
}

export function ExportTrack() {
  const { coordinatesFormat } = useMainAppSelector(state => state.map)
  const { selectedVesselPositions } = useMainAppSelector(state => state.vessel)
  const { trackEvent } = useTracking()

  const exportedPositions: VesselPositionWithId[] =
    selectedVesselPositions
      ?.map(position => {
        const coordinates = getCoordinates([position.longitude, position.latitude], WSG84_PROJECTION, coordinatesFormat)
        if (!coordinates[0] || !coordinates[1]) {
          return undefined
        }

        return {
          ...position,
          id: position.dateTime,
          latitude: coordinates[0],
          longitude: coordinates[1]
        }
      })
      ?.filter((position): position is VesselPositionWithId => position !== undefined) ?? []

  const downloadCSV = useCallback(
    positions => {
      if (!positions?.length) {
        return
      }

      const vesselIdentifier = positions[0].internalReferenceNumber
        ? positions[0].internalReferenceNumber
        : positions[0].ircs
      const date = getDate(dayjs().toISOString())
      const randomNumber = Math.floor(Math.random() * 100) + 1
      const fileName = `export_${vesselIdentifier}_vms_${date}_${randomNumber}`

      /* eslint-disable sort-keys-fix/sort-keys-fix */
      const csvMap: DownloadAsCsvMap<VesselPositionWithId> = {
        vesselName: 'Nom',
        externalReferenceNumber: 'Marq. Ext.',
        ircs: 'C/S',
        mmsi: 'MMSI',
        internalReferenceNumber: 'CFR',
        flagState: {
          label: 'Pavillon',
          transform: position => countries.getName(position.flagState.toLowerCase(), 'fr')?.toString()
        },
        dateTime: 'GDH (UTC)',
        latitude: 'Latitude',
        longitude: 'Longitude',
        course: 'Cap',
        speed: 'Vitesse',
        isAtPort: {
          label: 'Au port',
          transform: position => (position.isAtPort ? 'Oui' : 'Non')
        },
        networkType: {
          label: 'Type de réseau',
          transform: position => {
            if (position.networkType === Vessel.NetworkType.CELLULAR) {
              return 'Cellulaire'
            }

            if (position.networkType === Vessel.NetworkType.SATELLITE) {
              return 'Satellite'
            }

            return 'Inconnu'
          }
        }
      }
      /* eslint-enable sort-keys-fix/sort-keys-fix */

      trackEvent({
        action: "Téléchargement des positions d'un navire",
        category: 'DOWNLOAD',
        name: fileName
      })
      downloadAsCsv(fileName, positions, csvMap)
    },
    [trackEvent]
  )

  return (
    <ExportTrackButton
      $isClickable={Boolean(exportedPositions?.length)}
      onClick={() => downloadCSV(exportedPositions)}
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
  $isClickable: boolean
}>`
  align-self: flex-start;
  cursor: ${p => (p.$isClickable ? 'pointer' : 'not-allowed')};
  margin: 0;
  padding: 4px 8px 8px 4px;
  text-align: left;

  &:hover,
  &:focus {
    background: ${p => p.theme.color.charcoal};
  }
`

const ExportIcon = styled(ExportSVG)`
  height: 24px;
  margin-right: 4px;
  width: 24px;
`
