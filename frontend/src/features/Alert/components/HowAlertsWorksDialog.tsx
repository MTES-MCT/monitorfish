import { useGetAllAlertSpecificationsQuery } from '@features/Alert/apis'
import { PendingAlertValueType } from '@features/Alert/constants'
import { Accent, Button, Dialog, Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { Promisable } from 'type-fest'

export type HowAlertsWorksDialogProps = {
  onClose: () => Promisable<void>
}
export function HowAlertsWorksDialog({ onClose }: HowAlertsWorksDialogProps) {
  const { data: alertSpecifications } = useGetAllAlertSpecificationsQuery()

  const numberOfPositionsAlerts = (alertSpecifications ?? []).filter(
    alertSpecification =>
      alertSpecification.type === PendingAlertValueType.POSITION_ALERT && alertSpecification.isActivated
  ).length

  return (
    <StyledDialog isAbsolute>
      <Dialog.Title>Fonctionnement des alertes</Dialog.Title>
      <StyledBody>
        <Title>PRINCIPE D’UNE ALERTE</Title>
        <Line />
        <Text>
          Une alerte est une <b>suspicion d’infraction automatiquement détectée par MonitorFish</b>, s’appuyant sur
          différentes données de l’application.
          <br />
          Aujourd’hui, elles ne concernent que les navires dotés de VMS, et pour certaines alertes que les navires dotés
          de JPE.
          <br />
          La majorité des alertes nécessitent <b>une vérification de la part du CNSP</b>, afin de prendre en compte
          toutes les situations possibles (dérogations, exemptions, parcours VMS particuliers…) et de s’assurer qu’il y
          a bien une anomalie. <br />
          Si l’alerte est validée par l’agent qui la vérifie, elle devient un signalement sur la fiche du navire.
          <br />
          Si l’agent estime au contraire qu’elle n’est pas valide, il la suspend pour une durée adaptée à chaque
          situation. <br />
          <br />
          Aujourd’hui, MonitorFish compte au total {numberOfPositionsAlerts + 4} alertes :<br />-{' '}
          <b>{numberOfPositionsAlerts} alertes concernant des positions VMS</b> : pêche en ZEE française par un navire
          tiers, pêche dans les 12 milles sans droits historiques, chalutage dans les 3 milles, pêche en zone RTC, etc.
          <br />- <b>4 alertes concernant les obligations déclaratives</b> : absence de message DEP, absence de message
          FAR en 24h et en 48h, suspicion de sous-déclaration.
        </Text>
        <Title>DÉTAIL DU FONCTIONNEMENT DES ALERTES</Title>
        <Line />
        <Text>
          Plusieurs alertes s’appuient sur le fait de savoir <b>si un navire est ou non en mer</b>, et{' '}
          <b>s’il est ou non en pêche</b>.
        </Text>
        <Block>
          <Columns>
            <FirstColumn>
              <Icon.FleetSegment />
            </FirstColumn>
            <SecondColumn>
              <b>Un navire est en mer</b> s’il émet des positions <b>hors d’un port ou d’une zone de mouillage</b> et{' '}
              <b>hors d’une zone considérée comme terrestre</b>.
            </SecondColumn>
          </Columns>
          <br />
          <Columns>
            <FirstColumn>
              <Icon.FishingEngine />
            </FirstColumn>
            <SecondColumn>
              <b>Un navire est en pêche</b> s’il est en mer depuis au moins 1h, et si sa vitesse moyenne est comprise
              entre <b>0,025 nds et 5,5 nds sur 3 positions consécutives</b> (donc sur au moins deux segments de
              trajectoire). <br />
              Ce seuil de 5,5 nds a été déterminé par l’analyse de données VMS de navires mettant en œuvre tous les
              types d’engins. Il constitue le meilleur compromis entre sensibilité (&quot;ne pas rater d’activité de
              pêche&quot;) et spécificité (&quot;ne pas détecter d’activité de pêche là où il n’y en a pas&quot;).
            </SecondColumn>
          </Columns>
        </Block>
      </StyledBody>
      <StyledAction>
        <Button accent={Accent.SECONDARY} onClick={onClose}>
          Fermer
        </Button>
      </StyledAction>
    </StyledDialog>
  )
}

const StyledAction = styled(Dialog.Action)`
  padding-top: 40px;
  padding-bottom: 40px;
`

const StyledDialog = styled(Dialog)`
  > div {
    &:not(:first-child) {
      max-width: 1224px;
    }
  }

  p {
    color: ${p => p.theme.color.gunMetal};
  }
`

const StyledBody = styled(Dialog.Body)`
  padding: 8px 64px 0 64px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  text-align: left;
`

const Text = styled.p`
  margin-top: 16px;
  line-height: 22px;
  width: 950px;
`

const Title = styled.div`
  margin-top: 32px;
  font-size: 16px;
  color: ${p => p.theme.color.slateGray};
  font-weight: 700;
  text-transform: uppercase;
`

const Line = styled.div`
  margin-top: 5px;
  width: 100%;
  border-bottom: 2px solid ${p => p.theme.color.lightGray};
`

const Block = styled.div`
  background: ${p => p.theme.color.gainsboro};
  padding: 16px 16px;
  margin-top: 16px;
  max-width: 950px;
  flex-direction: row;
`

const Columns = styled.div`
  display: flex;
  gap: 8px;
`

const FirstColumn = styled.div`
  width: 20px;
`

const SecondColumn = styled.div`
  width: 850px;
`
