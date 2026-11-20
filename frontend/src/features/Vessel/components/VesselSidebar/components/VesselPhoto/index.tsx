import { useOpenVesselPhotosContributorId } from '@features/Vessel/hooks/useOpenVesselPhotosContributorId'
import {
  isSubmissionOfVessel,
  OpenVesselPhotoSubmissionStatus,
  useGetOpenVesselPhotoQuery,
  useGetOpenVesselPhotoSubmissionsQuery
} from '@features/Vessel/openVesselPhotosApi'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Icon, Size } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { getColorWithAlpha } from 'features/Map/layers/styles/utils'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { AddVesselPhotoDialog } from './AddVesselPhotoDialog'

export function VesselPhoto() {
  const cfr = useMainAppSelector(state => state.vessel.selectedVessel?.internalReferenceNumber)
  const mmsi = useMainAppSelector(state => state.vessel.selectedVessel?.mmsi)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | undefined>(undefined)

  const keys = useMemo(() => ({ cfr: getNonEmpty(cfr), mmsi: getNonEmpty(mmsi) }), [cfr, mmsi])
  const hasKey = !!keys.cfr || !!keys.mmsi
  const { data: photo, isFetching } = useGetOpenVesselPhotoQuery(hasKey ? keys : skipToken)
  const contributorId = useOpenVesselPhotosContributorId()
  const { data: submissions } = useGetOpenVesselPhotoSubmissionsQuery(contributorId ?? skipToken)
  const isPhotoPending = !!submissions?.some(
    submission =>
      submission.status === OpenVesselPhotoSubmissionStatus.PENDING && isSubmissionOfVessel(submission, keys)
  )

  if (isFetching) {
    return <Zone $height={210} />
  }

  if (photo && photo.url !== failedPhotoUrl) {
    return (
      <PhotoZone data-cy="vessel-photo">
        <PhotoFrame>
          <Photo
            alt="Photo du navire"
            onError={() => setFailedPhotoUrl(photo.url)}
            referrerPolicy="no-referrer"
            src={photo.url}
          />
          <Credits title={photo.attribution}>{photo.attribution}</Credits>
        </PhotoFrame>
      </PhotoZone>
    )
  }

  return (
    <Zone data-cy="vessel-photo-missing">
      {isPhotoPending ? (
        <EmptyText data-cy="vessel-photo-pending">
          Une photo a été ajoutée par vous pour ce navire,
          <br />
          elle est en attente de vérification.
        </EmptyText>
      ) : (
        <EmptyText>Ce navire n&apos;a pas encore de photo libre de droits.</EmptyText>
      )}
      {hasKey && (
        <Button
          accent={Accent.SECONDARY}
          disabled={isPhotoPending}
          Icon={Icon.Plus}
          isFullWidth
          onClick={() => setIsDialogOpen(true)}
          size={Size.NORMAL}
        >
          Ajouter une photo du navire
        </Button>
      )}
      {isDialogOpen && (
        <AddVesselPhotoDialog contributorId={contributorId} keys={keys} onClose={() => setIsDialogOpen(false)} />
      )}
    </Zone>
  )
}

function getNonEmpty(value: string | undefined): string | undefined {
  return value === '' ? undefined : value
}

const Zone = styled.div<{ $height?: number }>`
  background: ${p => p.theme.color.white};
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  ${p => (p.$height ? `height: ${p.$height}px;` : '')}
`

const PhotoZone = styled(Zone)`
  padding: 16px;
`

const PhotoFrame = styled.div`
  position: relative;
  width: 100%;
`

const Photo = styled.img`
  display: block;
  height: auto;
  width: 100%;
`

const Credits = styled.span`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1px 8px;
  background: ${p => getColorWithAlpha(p.theme.color.gainsboro, 0.7)};
  font-size: 11px;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const EmptyText = styled.p`
  color: ${p => p.theme.color.slateGray};
  font-size: 13px;
  margin: 6px 6px 16px;
  text-align: center;
`
