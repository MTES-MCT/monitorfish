import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { useOpenVesselPhotosContributorId } from '@features/Vessel/hooks/useOpenVesselPhotosContributorId'
import {
  OpenVesselPhotoSubmissionStatus,
  useGetOpenVesselPhotoSubmissionsQuery,
  useMarkOpenVesselPhotoSubmissionAsSeenMutation
} from '@features/Vessel/openVesselPhotosApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button, Dialog, Level } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

const POLLING_INTERVAL_IN_MS = 60 * 60 * 1000

/**
 * Thanks the user once a photo sent to Open Vessel Photos is received, then tells them when it is approved or
 * rejected.
 */
export function OpenVesselPhotoSubmissionNotification() {
  const dispatch = useMainAppDispatch()
  const contributorId = useOpenVesselPhotosContributorId()
  const knownPendingIdsRef = useRef<Set<number> | undefined>(undefined)
  const { data: submissions } = useGetOpenVesselPhotoSubmissionsQuery(contributorId ?? skipToken, {
    pollingInterval: POLLING_INTERVAL_IN_MS,
    refetchOnFocus: true,
    skipPollingIfUnfocused: true
  })
  const [markAsSeen] = useMarkOpenVesselPhotoSubmissionAsSeenMutation()

  useEffect(() => {
    if (!submissions) {
      return
    }

    const pendingIds = submissions
      .filter(submission => submission.status === OpenVesselPhotoSubmissionStatus.PENDING)
      .map(submission => submission.id)
    // The photos already waiting when MonitorFish is opened were thanked for before
    if (knownPendingIdsRef.current) {
      const knownPendingIds = knownPendingIdsRef.current
      if (pendingIds.some(id => !knownPendingIds.has(id))) {
        dispatch(
          addMainWindowBanner({
            children:
              'Merci pour votre contribution ! Vous serez notifié·e dans MonitorFish une fois votre photo vérifiée et acceptée.',
            closingDelay: 6000,
            isClosable: true,
            level: Level.SUCCESS,
            withAutomaticClosing: true
          })
        )
      }
    }
    knownPendingIdsRef.current = new Set(pendingIds)
  }, [dispatch, submissions])

  const reviewedSubmission = submissions?.find(
    submission => submission.status !== OpenVesselPhotoSubmissionStatus.PENDING
  )
  if (!contributorId || !reviewedSubmission) {
    return null
  }

  const vesselName = reviewedSubmission.vesselName ? getTitleCase(reviewedSubmission.vesselName) : 'ce navire'
  const isApproved = reviewedSubmission.status === OpenVesselPhotoSubmissionStatus.APPROVED
  const close = () => {
    markAsSeen({ contributorId, id: reviewedSubmission.id })
  }

  return (
    <StyledDialog data-cy="open-vessel-photo-submission-notification">
      <Dialog.Title onClose={close}>{`Ajout d'une photo du navire ${vesselName}`}</Dialog.Title>
      <StyledBody>
        {isApproved ? (
          <>
            <p>🎉 Félicitations !</p>
            <p>
              La photo que vous aviez ajoutée pour le navire <b>{vesselName}</b> a été vérifiée et ajoutée à
              MonitorFish.
            </p>
            <p>
              Merci pour votre contribution, n&apos;hésitez pas à envoyer d&apos;autres photos pour continuer à enrichir
              les fiches navires.
            </p>
          </>
        ) : (
          <>
            <p>
              La photo que vous aviez ajoutée pour le navire <b>{vesselName}</b> n&apos;a pas été acceptée
              {reviewedSubmission.rejectReason ? <> : {reviewedSubmission.rejectReason}</> : ''}.
            </p>
            <p>N&apos;hésitez pas à en envoyer une autre depuis la fiche navire.</p>
          </>
        )}
      </StyledBody>
      <StyledAction>
        <Button accent={Accent.SECONDARY} onClick={close}>
          Fermer
        </Button>
      </StyledAction>
    </StyledDialog>
  )
}

function getTitleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^|[\s'-])(\p{L})/gu, (_, separator: string, letter: string) => separator + letter.toUpperCase())
}

const StyledDialog = styled(Dialog)`
  > div:nth-child(2) {
    width: 640px;
  }

  h4 {
    font-size: 16px;
  }
`

const StyledBody = styled(Dialog.Body)`
  font-size: 16px;
  padding: 20px 20px 0;
  text-align: left;

  > p {
    color: ${p => p.theme.color.gunMetal};
    line-height: 22px;
    margin-bottom: 16px;
  }
`

const StyledAction = styled(Dialog.Action)`
  button {
    font-size: 16px;
  }
`
