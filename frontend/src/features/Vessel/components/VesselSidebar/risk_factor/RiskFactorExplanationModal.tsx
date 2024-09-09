import { Modal } from 'rsuite'
import styled from 'styled-components'

import { RiskFactorBox } from './RiskFactorBox'
import { RiskFactorExplanationSchema } from './RiskFactorExplanationSchema'
import {
  getDetectabilityRiskFactorText,
  getImpactRiskFactorText,
  getProbabilityRiskFactorText,
  getRiskFactorColor
} from '../../../../../domain/entities/vessel/riskFactor'
import { StyledModalHeader } from '../../../../commonComponents/StyledModalHeader'
import { basePrimaryButton, SecondaryButton } from '../../../../commonStyles/Buttons.style'
import RiskFactorControlSVG from '../../icons/Note_de_controle_gyrophare.svg?react'
import RiskFactorImpactSVG from '../../icons/Note_impact_poisson.svg?react'
import RiskFactorInfractionsSVG from '../../icons/Note_infraction_stop.svg?react'

import type { Promisable } from 'type-fest'

type RiskFactorExplanationModalProps = Readonly<{
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => Promisable<void>
}>
export function RiskFactorExplanationModal({ isOpen, setIsOpen }: RiskFactorExplanationModalProps) {
  return (
    <Modal backdrop onClose={() => setIsOpen(false)} open={isOpen} size="lg" style={{ marginTop: 50 }}>
      <StyledModalHeader>
        <Modal.Title>
          <ModalTitle>Explication de la note de risque des navires</ModalTitle>
        </Modal.Title>
      </StyledModalHeader>
      <ModalBodyStyled>
        <Title>principe du facteur de risque</Title>
        <Line />
        <Text>
          Le facteur de risque est <b>une métrique, notée de 1 à 4</b>, calculée pour chaque navire sur la base de ses
          données (historique et temps réel).
          <br />
          Il a pour but de vous aider à <b>hiérarchiser les navires à contrôler</b>, et orienter plus facilement les
          unités sur le terrain.
          <br />
          <br />
          Ce facteur se fonde sur :<br />- une estimation de <b>l&apos;impact</b> de l&apos;activité de pêche sur la
          ressource
          <br />- une estimation de <b>la probabilité</b> qu&apos;un navire donné soit en situation d&apos;infraction
          <br />- une troisième composante de <b>répartition de l&apos;effort de contrôle</b>, qui prend en compte la
          fréquence de contrôle du navire ainsi que la <br />
          priorité de contrôle de son segment de flotte.
          <br />
          <br />À chacune des trois composantes du facteur est appliqué un <b>coefficient</b>, défini à la suite
          d&apos;ateliers faits avec les agents du CNSP sur le sujet.
          <br />
          <RiskFactorExplanationSchema />
        </Text>
        <Title>Détail des composantes du facteur</Title>
        <Line />
        <Text>
          Comme le facteur de risque, ses trois composantes sont notées de 1 à 4, avec des seuils qui peuvent varier.
        </Text>
        <SubTitle>
          <RiskFactorImpact />
          Calcul du score d&apos;impact
        </SubTitle>
        <SmallLine />
        <Text>
          Le score d&apos;impact est défini en prenant le <b>niveau de risque du segment de flotte</b> auquel appartient
          un navire de pêche en temps réel.
          <br />
          Ce niveau de risque est <b>évalué par les DIRM chaque année</b> pour chaque segment de flotte, via les Plans
          Inter-Régionaux de Contrôle (PIRC).
          <br />
          <br />
          Lorsqu&apos;un navire appartient à plusieurs segments de flotte,{' '}
          <b>c&apos;est le segment dont le score est le plus élevé qui est retenu</b>.<br />
        </Text>
        <RiskFactorLegend isFirst>
          <RiskFactorBox color={getRiskFactorColor(1)}>1</RiskFactorBox>
          {getImpactRiskFactorText(1)} - ou pas de segment
        </RiskFactorLegend>
        <RiskFactorLegend>
          <RiskFactorBox color={getRiskFactorColor(2)}>2</RiskFactorBox>
          {getImpactRiskFactorText(2)}
        </RiskFactorLegend>
        <RiskFactorLegend>
          <RiskFactorBox color={getRiskFactorColor(3)}>3</RiskFactorBox>
          {getImpactRiskFactorText(3)}
        </RiskFactorLegend>
        <RiskFactorLegend isLast>
          <RiskFactorBox color={getRiskFactorColor(4)}>4</RiskFactorBox>
          {getImpactRiskFactorText(4)}
        </RiskFactorLegend>
        <SubTitle>
          <RiskFactorInfractions />
          Calcul du score de probabilité d&apos;infraction
        </SubTitle>
        <SmallLine />
        <Text>
          Le score de probabilité d&apos;infraction d&apos;un navire prend en compte les{' '}
          <b>10 infractions de pêche les plus récentes au cours des 5 dernières</b>
          <br /> années. Il considère à la fois{' '}
          <b>le nombre d&apos;infractions enregistré à chaque contrôle et l&apos;ancienneté des contrôles effectués </b>
          (plus un contrôle <br />
          est ancien, moins ses infractions vont peser dans le score).
        </Text>
        <RiskFactorLegend isFirst>
          <RiskFactorBox color={getRiskFactorColor(1)}>1</RiskFactorBox>
          {getProbabilityRiskFactorText(1)}
        </RiskFactorLegend>
        <RiskFactorLegend>
          <RiskFactorBox color={getRiskFactorColor(2)}>2</RiskFactorBox>
          {getProbabilityRiskFactorText(2)}
        </RiskFactorLegend>
        <RiskFactorLegend>
          <RiskFactorBox color={getRiskFactorColor(3)}>3</RiskFactorBox>
          {getProbabilityRiskFactorText(3)}
        </RiskFactorLegend>
        <RiskFactorLegend isLast>
          <RiskFactorBox color={getRiskFactorColor(4)}>4</RiskFactorBox>
          {getProbabilityRiskFactorText(4)} – ou absence d&apos;antériorité de contrôle
        </RiskFactorLegend>
        <SubTitle>
          <RiskFactorControl />
          Calcul du score de &quot;détectabilité&quot;
        </SubTitle>
        <SmallLine />
        <Text>
          Le score de détectabilité est plus élevé pour les navires qui ont été{' '}
          <b>peu contrôlés au cours des dernières années</b> et pour les navires qui
          <br />
          appartiennent à <b>des segments de flotte dont le niveau de priorité de contrôle est plus élevé</b>.<br />
          Il est fondé sur deux composantes :<br />- <b>le niveau de contrôle du navire</b>, calculé selon son
          historique de contrôle des 3 dernières années
          <br />- <b>le niveau de priorité de contrôle du segment de flotte du navire</b>, piloté par le CNSP selon
          l&apos;avancée des objectifs de contrôle et la
          <br />
          saisonnalité des pêcheries
        </Text>
        <RiskFactorLegend isFirst>
          <RiskFactorBox color={getRiskFactorColor(1)}>1</RiskFactorBox>
          {getDetectabilityRiskFactorText(1)}
        </RiskFactorLegend>
        <RiskFactorLegend>
          <RiskFactorBox color={getRiskFactorColor(2)}>2</RiskFactorBox>
          {getDetectabilityRiskFactorText(2)}
        </RiskFactorLegend>
        <RiskFactorLegend>
          <RiskFactorBox color={getRiskFactorColor(3)}>3</RiskFactorBox>
          {getDetectabilityRiskFactorText(3)}
        </RiskFactorLegend>
        <RiskFactorLegend>
          <RiskFactorBox color={getRiskFactorColor(4)}>4</RiskFactorBox>
          {getDetectabilityRiskFactorText(4)}
        </RiskFactorLegend>
      </ModalBodyStyled>
      <Modal.Footer>
        <DocumentationLink
          href="https://monitorfish.readthedocs.io/fr/latest/risk-factor.html#risk-factor"
          target="_blank"
        >
          Consulter la documentation de MonitorFish
        </DocumentationLink>
        <CloseButton onClick={() => setIsOpen(false)}>Fermer</CloseButton>
      </Modal.Footer>
    </Modal>
  )
}

const DocumentationLink = styled.a`
  ${basePrimaryButton}
  color: ${p => p.theme.color.gainsboro} !important;
  font-size: 13px;
  padding: 6px 12px;
  margin: 20px 0 20px 10px;
`

const CloseButton = styled(SecondaryButton)`
  margin-right: 20px;
`

const RiskFactorLegend = styled.div<{
  isFirst?: boolean
  isLast?: boolean
}>`
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
  margin: 7px 0;
  margin-top: ${p => (p.isFirst ? 20 : 7)}px;
  margin-bottom: ${p => (p.isLast ? 25 : 7)}px;
`

const RiskFactorImpact = styled(RiskFactorImpactSVG)`
  width: 22px;
  margin-right: 7px;
  margin-top: 4px;
  vertical-align: sub;
`

const RiskFactorControl = styled(RiskFactorControlSVG)`
  width: 22px;
  margin-right: 7px;
  margin-top: 0;
  vertical-align: sub;
`

const RiskFactorInfractions = styled(RiskFactorInfractionsSVG)`
  width: 22px;
  margin-right: 7px;
  margin-top: 1px;
  vertical-align: sub;
`

const ModalBodyStyled = styled(Modal.Body)`
  padding: 50px 60px !important;
  max-height: 600px !important;
`

const Text = styled.p`
  color: ${p => p.theme.color.gunMetal};
  margin: 10px 0;
  line-height: 22px;
`

const Line = styled.div`
  margin-top: 5px;
  width: 100%;
  border-bottom: 2px solid ${p => p.theme.color.lightGray};
`

const SmallLine = styled.div`
  margin-top: 7px;
  margin-top: 5px;
  width: 300px;
  border-bottom: 2px solid ${p => p.theme.color.lightGray};
`

const ModalTitle = styled.div`
  font-size: 16px;
  line-height: 30px;
`

const Title = styled.div`
  font-size: 16px;
  color: ${p => p.theme.color.slateGray};
  font-weight: 700;
  text-transform: uppercase;
`

const SubTitle = styled.div`
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
  font-weight: 700;
  margin-top: 20px;
`
