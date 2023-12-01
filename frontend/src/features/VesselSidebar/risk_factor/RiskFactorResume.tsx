// TODO Fix the `no-unsafe-optional-chaining` statements.

import { useState } from 'react'
import styled from 'styled-components'

import { DetectabilityRiskFactorDetails } from './details/DetectabilityRiskFactorDetails'
import { ImpactRiskFactorDetails } from './details/ImpactRiskFactorDetails'
import { ProbabilityRiskFactorDetails } from './details/ProbabilityRiskFactorDetails'
import { RiskFactorCursor } from './RiskFactorCursor'
import { RiskFactorExplanationModal } from './RiskFactorExplanationModal'
import {
  getDetectabilityRiskFactorText,
  getImpactRiskFactorText,
  getProbabilityRiskFactorText,
  getRiskFactorColor
} from '../../../domain/entities/vessel/riskFactor'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { ChevronIcon } from '../../commonStyles/icons/ChevronIcon.style'
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
        <>
          <RiskFactorZone>
            <GlobalRiskFactor>Note de risque globale</GlobalRiskFactor>
            <GlobalRisk data-cy="global-risk-factor">
              <RiskFactorCursor
                color={getRiskFactorColor(selectedVessel?.riskFactor?.riskFactor)}
                height={24}
                isBig
                // eslint-disable-next-line no-unsafe-optional-chaining
                progress={(100 * selectedVessel?.riskFactor?.riskFactor) / 4}
                underCharter={selectedVessel.underCharter}
                // TODO `selectedVessel?.riskFactor?.riskFactor` is a `string | number`. Fix that.
                value={parseFloat(selectedVessel?.riskFactor?.riskFactor as unknown as string).toFixed(1)}
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
              <SubRiskHeader>
                <SubRiskTitle>Impact sur la ressource</SubRiskTitle>
                <Chevron $isOpen={impactRiskFactorIsOpen} />
              </SubRiskHeader>
              <RiskFactorImpact />
              <RiskFactorCursor
                color={getRiskFactorColor(selectedVessel?.riskFactor?.impactRiskFactor)}
                height={8}
                // eslint-disable-next-line no-unsafe-optional-chaining
                progress={(100 * selectedVessel?.riskFactor?.impactRiskFactor) / 4}
                // TODO `selectedVessel?.riskFactor?.riskFactor` is a `string | number`. Fix that.
                value={parseFloat(selectedVessel?.riskFactor?.impactRiskFactor as unknown as string).toFixed(1)}
              />
              <SubRiskText
                title={getImpactRiskFactorText(
                  selectedVessel?.riskFactor?.impactRiskFactor,
                  !!selectedVessel?.riskFactor?.segmentHighestImpact
                )}
              >
                {getImpactRiskFactorText(
                  selectedVessel?.riskFactor?.impactRiskFactor,
                  !!selectedVessel?.riskFactor?.segmentHighestImpact
                )}
              </SubRiskText>
            </SubRisk>
            <ImpactRiskFactorDetails isOpen={impactRiskFactorIsOpen} />
            <Line />
            <SubRisk
              data-cy="probability-risk-factor"
              onClick={() => setProbabilityRiskFactorIsOpen(!probabilityRiskFactorIsOpen)}
            >
              <SubRiskHeader>
                <SubRiskTitle>Probabilité d&apos;infraction</SubRiskTitle>
                <Chevron $isOpen={probabilityRiskFactorIsOpen} />
              </SubRiskHeader>
              <RiskFactorInfractions />
              <RiskFactorCursor
                color={getRiskFactorColor(selectedVessel?.riskFactor?.probabilityRiskFactor)}
                height={8}
                // eslint-disable-next-line no-unsafe-optional-chaining
                progress={(100 * selectedVessel?.riskFactor?.probabilityRiskFactor) / 4}
                // TODO `selectedVessel?.riskFactor?.riskFactor` is a `string | number`. Fix that.
                value={parseFloat(selectedVessel?.riskFactor?.probabilityRiskFactor as unknown as string).toFixed(1)}
              />
              <SubRiskText
                title={getProbabilityRiskFactorText(
                  selectedVessel?.riskFactor?.probabilityRiskFactor,
                  !!selectedVessel?.riskFactor?.numberControlsLastFiveYears
                )}
              >
                {getProbabilityRiskFactorText(
                  selectedVessel?.riskFactor?.probabilityRiskFactor,
                  !!selectedVessel?.riskFactor?.numberControlsLastFiveYears
                )}
              </SubRiskText>
            </SubRisk>
            <ProbabilityRiskFactorDetails isOpen={probabilityRiskFactorIsOpen} />
            <Line />
            <SubRisk
              data-cy="detectability-risk-factor"
              onClick={() => setDetectabilityRiskFactorIsOpen(!detectabilityRiskFactorIsOpen)}
            >
              <SubRiskHeader>
                <SubRiskTitle>Priorité de contrôle</SubRiskTitle>
                <Chevron $isOpen={detectabilityRiskFactorIsOpen} />
              </SubRiskHeader>
              <RiskFactorControl />
              <RiskFactorCursor
                color={getRiskFactorColor(selectedVessel?.riskFactor?.detectabilityRiskFactor)}
                height={8}
                // eslint-disable-next-line no-unsafe-optional-chaining
                progress={(100 * selectedVessel?.riskFactor?.detectabilityRiskFactor) / 4}
                // TODO `selectedVessel?.riskFactor?.riskFactor` is a `string | number`. Fix that.
                value={parseFloat(selectedVessel?.riskFactor?.detectabilityRiskFactor as unknown as string).toFixed(1)}
              />
              <SubRiskText
                title={getDetectabilityRiskFactorText(selectedVessel?.riskFactor?.detectabilityRiskFactor, true)}
              >
                {getDetectabilityRiskFactorText(selectedVessel?.riskFactor?.detectabilityRiskFactor, true)}
              </SubRiskText>
            </SubRisk>
            <DetectabilityRiskFactorDetails isOpen={detectabilityRiskFactorIsOpen} />
          </RiskFactorZone>
          <RiskFactorExplanationModal isOpen={riskFactorExplanationIsOpen} setIsOpen={setRiskFactorExplanationIsOpen} />
        </>
      ) : (
        <NoRiskFactor>Ce navire n&apos;a pas de note de risque</NoRiskFactor>
      )}
    </>
  )
}

const GlobalText = styled.div<{
  $underCharter: boolean
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
  margin: 5px 5px 10px 5px;
  padding: 10px 10px 10px 25px;
  text-align: left;
  background: ${p => p.theme.color.white};
  font-size: 15px;
  color: ${p => p.theme.color.slateGray};
`

const Chevron = styled(ChevronIcon)`
  margin-right: 25px;
  margin-top: 15px;
  cursor: pointer;
  transition: 0.2s all;
`

const SubRiskHeader = styled.div`
  width: 100%;
  display: flex;
`

const SubRisk = styled.div`
  display: contents;
  cursor: pointer;
`

const GlobalRisk = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`

const SeeMore = styled.a<{
  $underCharter: boolean
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
  margin: 5px 5px 10px 5px;
  padding-top: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${p => p.theme.color.white};
`

const RiskFactorImpact = styled(RiskFactorImpactSVG)`
  width: 22px;
  margin-left: 35px;
  margin-top: 9px;
  margin-right: 7px;
`

const RiskFactorControl = styled(RiskFactorControlSVG)`
  width: 22px;
  margin-left: 35px;
  margin-top: 7px;
  margin-right: 7px;
`

const RiskFactorInfractions = styled(RiskFactorInfractionsSVG)`
  width: 22px;
  margin-left: 35px;
  margin-top: 8px;
  margin-right: 7px;
`

const Line = styled.div`
  width: 100%;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
`

const GlobalRiskFactor = styled.span`
  padding-left: 35px;
  font-size: 15px;
  color: ${p => p.theme.color.slateGray};
  width: 100%;
`

const SubRiskTitle = styled.div`
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
  padding-left: 35px;
  margin-top: 10px;
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
