// TODO Fix the `no-unsafe-optional-chaining` statements.

import { TransparentButton } from '@components/style'
import { ChevronIconButton } from '@features/commonStyles/icons/ChevronIconButton'
import {
  getDetectabilityRiskFactorText,
  getImpactRiskFactorText,
  getInfractionRateRiskFactorText,
  getRiskFactorColor
} from '@features/RiskFactor/utils'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { trackEvent } from '@hooks/useTracking'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { DetectabilityRiskFactorDetails } from './DetectabilityRiskFactorDetails'
import { ImpactRiskFactorDetails } from './ImpactRiskFactorDetails'
import { ProbabilityRiskFactorDetails } from './ProbabilityRiskFactorDetails'
import { RiskFactorCursor } from '../RiskFactorCursor'
import { RiskFactorExplanationModal } from './RiskFactorExplanationModal'
import RiskFactorInfractionsSVG from '../../../icons/Note_infraction_stop.svg?react'

export function RiskFactorResume() {
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)

  const [riskFactorExplanationIsOpen, setRiskFactorExplanationIsOpen] = useState(false)
  const [impactRiskFactorIsOpen, setImpactRiskFactorIsOpen] = useState(false)
  const [probabilityRiskFactorIsOpen, setProbabilityRiskFactorIsOpen] = useState(false)
  const [detectabilityRiskFactorIsOpen, setDetectabilityRiskFactorIsOpen] = useState(false)

  useEffect(() => {
    if (riskFactorExplanationIsOpen) {
      trackEvent({
        action: "Ouverture de la modale d'explication de la note de risque",
        category: 'RISK_FACTOR',
        name: ''
      })
    }
  }, [riskFactorExplanationIsOpen])

  useEffect(() => {
    if (impactRiskFactorIsOpen) {
      trackEvent({
        action: "Ouverture de l'explication de l'impact de la note de risque",
        category: 'RISK_FACTOR',
        name: ''
      })
    }
  }, [impactRiskFactorIsOpen])

  useEffect(() => {
    if (probabilityRiskFactorIsOpen) {
      trackEvent({
        action: "Ouverture de l'explication de la probabilité de la note de risque",
        category: 'RISK_FACTOR',
        name: ''
      })
    }
  }, [probabilityRiskFactorIsOpen])

  useEffect(() => {
    if (detectabilityRiskFactorIsOpen) {
      trackEvent({
        action: "Ouverture de l'explication de la détectabilité de la note de risque",
        category: 'RISK_FACTOR',
        name: ''
      })
    }
  }, [detectabilityRiskFactorIsOpen])

  return (
    <>
      {selectedVessel?.riskFactor?.riskFactor ? (
        <RiskFactorZone>
          <GlobalRiskFactor>Note de risque globale</GlobalRiskFactor>
          <GlobalRisk data-cy="global-risk-factor">
            <StyledRiskFactorCursor
              $height={30}
              color={getRiskFactorColor(selectedVessel.riskFactor.riskFactor)}
              height={24}
              isBig
              // eslint-disable-next-line no-unsafe-optional-chaining
              progress={(100 * selectedVessel.riskFactor.riskFactor) / 4}
              underCharter={selectedVessel.underCharter}
              value={selectedVessel.riskFactor.riskFactor}
            />
            <GlobalText $underCharter={selectedVessel.underCharter}>
              <SeeMore
                $underCharter={selectedVessel.underCharter}
                data-cy="show-risk-factor-explanation-modal"
                onClick={() => setRiskFactorExplanationIsOpen(true)}
              >
                En savoir plus
              </SeeMore>
              {selectedVessel.underCharter ? <UnderCharterText>navire sous charte</UnderCharterText> : null}
            </GlobalText>
          </GlobalRisk>
          <Line />
          <SubRisk data-cy="impact-risk-factor" onClick={() => setImpactRiskFactorIsOpen(!impactRiskFactorIsOpen)}>
            <SubRiskWrapper>
              <SubRiskTitle>Impact sur la ressource</SubRiskTitle>
              <SubRiskContent>
                <FishIcon color={THEME.color.slateGray} />
                <StyledRiskFactorCursor
                  color={getRiskFactorColor(selectedVessel.riskFactor.impactRiskFactor)}
                  height={8}
                  // eslint-disable-next-line no-unsafe-optional-chaining
                  progress={(100 * selectedVessel.riskFactor.impactRiskFactor) / 4}
                  value={selectedVessel.riskFactor.impactRiskFactor}
                />
                <SubRiskText
                  title={getImpactRiskFactorText(
                    selectedVessel.riskFactor.impactRiskFactor,
                    !!selectedVessel.riskFactor.segmentHighestImpact
                  )}
                >
                  {getImpactRiskFactorText(
                    selectedVessel.riskFactor.impactRiskFactor,
                    !!selectedVessel.riskFactor.segmentHighestImpact
                  )}
                </SubRiskText>
              </SubRiskContent>
            </SubRiskWrapper>
            <Chevron
              isOpen={impactRiskFactorIsOpen}
              onClick={() => setImpactRiskFactorIsOpen(!impactRiskFactorIsOpen)}
            />
          </SubRisk>
          <ImpactRiskFactorDetails isOpen={impactRiskFactorIsOpen} />
          <Line />
          <SubRisk
            data-cy="probability-risk-factor"
            onClick={() => setProbabilityRiskFactorIsOpen(!probabilityRiskFactorIsOpen)}
          >
            <SubRiskWrapper>
              <SubRiskTitle>Probabilité d&apos;infraction</SubRiskTitle>
              <SubRiskContent>
                <RiskFactorInfractions />
                <StyledRiskFactorCursor
                  color={getRiskFactorColor(selectedVessel.riskFactor.probabilityRiskFactor)}
                  height={8}
                  // eslint-disable-next-line no-unsafe-optional-chaining
                  progress={(100 * selectedVessel.riskFactor.probabilityRiskFactor) / 4}
                  value={selectedVessel.riskFactor.probabilityRiskFactor}
                />
                <SubRiskText
                  title={getInfractionRateRiskFactorText(
                    selectedVessel.riskFactor.probabilityRiskFactor,
                    !!selectedVessel.riskFactor.numberControlsLastFiveYears
                  )}
                >
                  {getInfractionRateRiskFactorText(
                    selectedVessel.riskFactor.probabilityRiskFactor,
                    !!selectedVessel.riskFactor.numberControlsLastFiveYears
                  )}
                </SubRiskText>
              </SubRiskContent>
            </SubRiskWrapper>
            <Chevron
              isOpen={probabilityRiskFactorIsOpen}
              onClick={() => setProbabilityRiskFactorIsOpen(!probabilityRiskFactorIsOpen)}
            />
          </SubRisk>
          <ProbabilityRiskFactorDetails isOpen={probabilityRiskFactorIsOpen} />
          <Line />
          <SubRisk
            data-cy="detectability-risk-factor"
            onClick={() => setDetectabilityRiskFactorIsOpen(!detectabilityRiskFactorIsOpen)}
          >
            <SubRiskWrapper>
              <SubRiskTitle>Priorité de contrôle</SubRiskTitle>
              <SubRiskContent>
                <ControlUnitIcon color={THEME.color.slateGray} />
                <StyledRiskFactorCursor
                  color={getRiskFactorColor(selectedVessel.riskFactor.detectabilityRiskFactor)}
                  height={8}
                  // eslint-disable-next-line no-unsafe-optional-chaining
                  progress={(100 * selectedVessel.riskFactor.detectabilityRiskFactor) / 4}
                  value={selectedVessel.riskFactor.detectabilityRiskFactor}
                />
                <SubRiskText
                  title={getDetectabilityRiskFactorText(selectedVessel.riskFactor.detectabilityRiskFactor, true)}
                >
                  {getDetectabilityRiskFactorText(selectedVessel.riskFactor.detectabilityRiskFactor, true)}
                </SubRiskText>
              </SubRiskContent>
            </SubRiskWrapper>
            <Chevron
              isOpen={detectabilityRiskFactorIsOpen}
              onClick={() => setDetectabilityRiskFactorIsOpen(!detectabilityRiskFactorIsOpen)}
            />
          </SubRisk>
          <DetectabilityRiskFactorDetails isOpen={detectabilityRiskFactorIsOpen} />
        </RiskFactorZone>
      ) : (
        <NoRiskFactor>Ce navire n&apos;a pas de note de risque</NoRiskFactor>
      )}
      {riskFactorExplanationIsOpen && <RiskFactorExplanationModal setIsOpen={setRiskFactorExplanationIsOpen} />}
    </>
  )
}

const GlobalText = styled.div<{
  $underCharter: boolean | undefined
}>`
  ${p =>
    p.$underCharter
      ? `
  width: 100%;
  display: inline-block;
  `
      : null}
`

const UnderCharterText = styled.span`
  color: ${p => p.theme.color.mediumSeaGreen};
  font-size: 13px;
  font-weight: 500;
  margin-left: 9px;
  line-height: 39px;
`

const StyledRiskFactorCursor = styled(RiskFactorCursor)<{
  $height?: number
}>`
  height: ${p => (p.$height ? `${p.$height}px` : 'unset')};
`

const NoRiskFactor = styled.div`
  padding: 10px 10px 10px 25px;
  text-align: left;
  background: ${p => p.theme.color.white};
  font-size: 15px;
  color: ${p => p.theme.color.slateGray};
`

const Chevron = styled(ChevronIconButton)<{
  isOpen: boolean
}>`
  ${p => {
    if (p.isOpen) {
      return 'padding-left: 24px;'
    }

    return 'padding-right: 24px;'
  }}

  svg {
    color: ${p => p.theme.color.charcoal};
  }
`

const SubRisk = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
`

const SubRiskWrapper = styled(TransparentButton)`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const SubRiskContent = styled.div`
  display: flex;
  padding-bottom: 16px;
  align-items: end;
`

const GlobalRisk = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding-left: 24px;
  height: 46px;
`

const SeeMore = styled.a<{
  $underCharter: boolean | undefined
}>`
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
  text-decoration: underline;
  cursor: pointer;
  margin-top: ${p => (p.$underCharter ? -20 : 19)}px;
  margin-right: ${p => (p.$underCharter ? 25 : 16)}px;
  ${p =>
    p.$underCharter
      ? `
  position: relative;
  right: -100px;
  float: left;
  `
      : `line-height: 43px;`}
`

const RiskFactorZone = styled.div`
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${p => p.theme.color.white};
`

const FishIcon = styled(Icon.Fishery)`
  margin-left: 24px;
  margin-top: 6px;
  margin-right: 8px;
`

const ControlUnitIcon = styled(Icon.ControlUnit)`
  margin-left: 24px;
  margin-top: 6px;
  margin-right: 8px;
`

const RiskFactorInfractions = styled(RiskFactorInfractionsSVG)`
  width: 22px;
  margin-left: 24px;
  margin-top: 8px;
  margin-right: 7px;
`

const Line = styled.div`
  width: 100%;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
`

const GlobalRiskFactor = styled.span`
  padding-top: 14px;
  padding-left: 24px;
  color: ${p => p.theme.color.slateGray};
  width: 100%;
`

const SubRiskTitle = styled.h3`
  font-size: 13px;
  font-weight: 400;
  color: ${p => p.theme.color.slateGray};
  padding-left: 24px;
  width: 100%;
  line-height: 48px;
  height: 36px;
`

const SubRiskText = styled.span`
  margin-left: 8px;
  max-width: 130px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  font-weight: 500;
`
