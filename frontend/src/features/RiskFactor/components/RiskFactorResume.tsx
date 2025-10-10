// TODO Fix the `no-unsafe-optional-chaining` statements.

import { TransparentButton } from '@components/style'
import { ChevronIconButton } from '@features/commonStyles/icons/ChevronIconButton'
import {
  getDetectabilityRiskFactorText,
  getImpactRiskFactorText,
  getProbabilityRiskFactorText,
  getRiskFactorColor
} from '@features/RiskFactor/utils'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useState } from 'react'
import styled from 'styled-components'

import { DetectabilityRiskFactorDetails } from './details/DetectabilityRiskFactorDetails'
import { ImpactRiskFactorDetails } from './details/ImpactRiskFactorDetails'
import { ProbabilityRiskFactorDetails } from './details/ProbabilityRiskFactorDetails'
import { RiskFactorCursor } from './RiskFactorCursor'
import { RiskFactorExplanationModal } from './RiskFactorExplanationModal'
import RiskFactorControlSVG from '../../icons/Note_de_controle_gyrophare.svg?react'
import RiskFactorImpactSVG from '../../icons/Note_impact_poisson.svg?react'
import RiskFactorInfractionsSVG from '../../icons/Note_infraction_stop.svg?react'

export function RiskFactorResume() {
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)

  const [riskFactorExplanationIsOpen, setRiskFactorExplanationIsOpen] = useState(false)
  const [impactRiskFactorIsOpen, setImpactRiskFactorIsOpen] = useState(false)
  const [probabilityRiskFactorIsOpen, setProbabilityRiskFactorIsOpen] = useState(false)
  const [detectabilityRiskFactorIsOpen, setDetectabilityRiskFactorIsOpen] = useState(false)

  return (
    <>
      {selectedVessel?.riskFactor?.riskFactor ? (
        <RiskFactorZone>
          <GlobalRiskFactor>Note de risque globale</GlobalRiskFactor>
          <GlobalRisk data-cy="global-risk-factor">
            <RiskFactorCursor
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
                <RiskFactorImpact />
                <RiskFactorCursor
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
                <RiskFactorCursor
                  color={getRiskFactorColor(selectedVessel.riskFactor.probabilityRiskFactor)}
                  height={8}
                  // eslint-disable-next-line no-unsafe-optional-chaining
                  progress={(100 * selectedVessel.riskFactor.probabilityRiskFactor) / 4}
                  value={selectedVessel.riskFactor.probabilityRiskFactor}
                />
                <SubRiskText
                  title={getProbabilityRiskFactorText(
                    selectedVessel.riskFactor.probabilityRiskFactor,
                    !!selectedVessel.riskFactor.numberControlsLastFiveYears
                  )}
                >
                  {getProbabilityRiskFactorText(
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
                <RiskFactorControl />
                <RiskFactorCursor
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

const NoRiskFactor = styled.div`
  padding: 10px 10px 10px 25px;
  text-align: left;
  background: ${p => p.theme.color.white};
  font-size: 15px;
  color: ${p => p.theme.color.slateGray};
`

const Chevron = styled(ChevronIconButton)`
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
  width: 90%;
`

const SubRiskContent = styled.div`
  display: flex;
`

const GlobalRisk = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`

const SeeMore = styled.a<{
  $underCharter: boolean | undefined
}>`
  font-size: 11px;
  color: ${p => p.theme.color.slateGray};
  text-decoration: underline;
  cursor: pointer;
  margin-top: ${p => (p.$underCharter ? -20 : 19)}px;
  margin-right: ${p => (p.$underCharter ? 25 : 12)}px;
  ${p =>
    p.$underCharter
      ? `
  margin-top: -20px;
  margin-right: 25px;
  position: relative;
  right: -100px;
  float: left;
  `
      : `
  margin-right: 12px;
  line-height: 43px;
  `}
`

const RiskFactorZone = styled.div`
  padding-top: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${p => p.theme.color.white};
`

const RiskFactorImpact = styled(RiskFactorImpactSVG)`
  width: 22px;
  margin-left: 24px;
  margin-top: 9px;
  margin-right: 7px;
`

const RiskFactorControl = styled(RiskFactorControlSVG)`
  width: 22px;
  margin-left: 24px;
  margin-top: 7px;
  margin-right: 7px;
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
  padding-left: 24px;
  font-size: 15px;
  color: ${p => p.theme.color.slateGray};
  width: 100%;
`

const SubRiskTitle = styled.h3`
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
  padding-left: 24px;
  width: 100%;
`

const SubRiskText = styled.span`
  margin: 8px;
  margin-bottom: 12px;
  max-width: 130px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  font-weight: 500;
`
