import { getOpenVesselPhotosContributeUrl, type OpenVesselPhotoKeys } from '@features/Vessel/openVesselPhotosApi'
import { trackEvent } from '@hooks/useTracking'
import { Accent, Button, Dialog, Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type AddVesselPhotoDialogProps = {
  contributorId: string | undefined
  keys: OpenVesselPhotoKeys
  onClose: () => void
}
export function AddVesselPhotoDialog({ contributorId, keys, onClose }: AddVesselPhotoDialogProps) {
  const openContributeForm = () => {
    trackEvent({
      action: "Ouverture du formulaire d'ajout de photo Open Vessel Photos",
      category: 'VESSEL_PHOTO',
      name: keys.cfr ?? keys.mmsi ?? ''
    })

    window.open(getOpenVesselPhotosContributeUrl(keys, contributorId), '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <StyledDialog>
      <Dialog.Title onClose={onClose}>Ajouter votre photo du navire</Dialog.Title>
      <StyledBody>
        <p>
          <b>La photo du navire doit avoir été prise par vous-même ou être libre de droits.</b> Elle est déposée sur{' '}
          <b>Open Vessel Photos</b>, une photothèque ouverte de navires, sous licence libre. Une fois vérifiée, elle
          s&apos;affichera automatiquement dans la fiche navire de MonitorFish.
        </p>
        <p>
          Le formulaire d&apos;Open Vessel Photos s&apos;ouvre dans un nouvel onglet, avec le CFR et le MMSI du navire
          déjà renseignés.
          {!!contributorId && <> Vous serez notifié·e dans MonitorFish une fois votre photo vérifiée.</>}
        </p>
      </StyledBody>
      <StyledAction>
        <Button accent={Accent.SECONDARY} onClick={onClose}>
          Annuler
        </Button>
        <Button accent={Accent.PRIMARY} Icon={Icon.ExternalLink} onClick={openContributeForm}>
          Ajouter la photo sur Open Vessel Photos
        </Button>
      </StyledAction>
    </StyledDialog>
  )
}

const StyledDialog = styled(Dialog)`
  > div:nth-child(2) {
    width: 760px;
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
