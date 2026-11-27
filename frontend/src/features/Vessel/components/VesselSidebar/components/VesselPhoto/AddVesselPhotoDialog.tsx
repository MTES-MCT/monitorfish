import { getOpenVesselPhotosContributeUrl, type OpenVesselPhotoKeys } from '@features/Vessel/openVesselPhotosApi'
import { trackEvent } from '@hooks/useTracking'
import { Accent, Button, Dialog, Icon, Level, Link, Message } from '@mtes-mct/monitor-ui'
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
      <Dialog.Title onClose={onClose}>Ajouter une photo du navire</Dialog.Title>
      <StyledBody>
        <p>
          Vous pouvez charger une photo de ce navire sur{' '}
          <Link href="https://openvesselphotos.org/fr" target="_blank">
            Open Vessel Photo
          </Link>
          , une photothèque ouverte de photos sous licence libre.{' '}
          <b>La photo doit avoir été prise par vous-même ou être libre de droits.</b>
        </p>
        <p>
          Le formulaire d’Open Vessel Photos s’ouvre dans un nouvel onglet, avec le CFR et le MMSI du navire déjà
          renseignés.
          <br />
          Une fois la photo vérifiée,{' '}
          <b>
            vous en serez notifié.e directement dans MonitorFish et elle s’affichera automatiquement dans la fiche du
            navire.
          </b>
        </p>
        <StyledMessage level={Level.INFO}>
          <b>Qu&apos;est-ce qu&apos;une bonne photo de navire ?</b>
          <ul>
            <li>La coque entière dans le cadre, si possible de profil</li>
            <li>Le nom ou l&apos;immatriculation lisible</li>
            <li>Pas de visages en gros plan</li>
          </ul>
          <i>NB : les données de localisation (EXIF/GPS) sont supprimées de chaque photo.</i>
        </StyledMessage>
      </StyledBody>
      <StyledAction>
        <Button accent={Accent.SECONDARY} onClick={onClose}>
          Annuler
        </Button>
        <Button accent={Accent.PRIMARY} Icon={Icon.ExternalLink} onClick={openContributeForm}>
          Ajouter une photo sur Open Vessel Photos
        </Button>
      </StyledAction>
    </StyledDialog>
  )
}

const StyledDialog = styled(Dialog)`
  > div:nth-child(2) {
    width: 648px;
  }

  h4 {
    font-size: 16px;
  }
`

const StyledBody = styled(Dialog.Body)`
  font-size: 16px;
  padding: 20px 20px 0;
  text-align: left;

  a {
    font-size: 16px;
  }

  > p {
    color: ${p => p.theme.color.gunMetal};
    line-height: 22px;
    margin-bottom: 16px;
  }

  ul {
    margin: 4px 0 8px;
    padding-left: 8px;
  }

  li {
    list-style: inside;
  }
`

const StyledMessage = styled(Message)`
  margin-top: 8px;

  b {
    color: #45688a;
  }
`

const StyledAction = styled(Dialog.Action)`
  button {
    font-size: 16px;
  }
`
