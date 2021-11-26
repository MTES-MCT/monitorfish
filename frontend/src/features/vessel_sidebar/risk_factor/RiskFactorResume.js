import React, { useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import RiskFactorCursor from './RiskFactorCursor'
import {
  getDetectabilityRiskFactorText,
  getImpactRiskFactorText,
  getProbabilityRiskFactorText,
  getRiskFactorColor
} from '../../../domain/entities/riskFactor'
import { ReactComponent as RiskFactorImpactSVG } from '../../icons/Note_impact_poisson.svg'
import { ReactComponent as RiskFactorControlSVG } from '../../icons/Note_de_controle_gyrophare.svg'
import { ReactComponent as RiskFactorInfractionsSVG } from '../../icons/Note_infraction_stop.svg'
import RiskFactorExplanationModal from './RiskFactorExplanationModal'
import { useSelector } from 'react-redux'
import ImpactRiskFactorDetails from './details/ImpactRiskFactorDetails'
import { ChevronIcon } from '../../commonStyles/icons/ChevronIcon.style'
import ProbabilityRiskFactorDetails from './details/ProbabilityRiskFactorDetails'
import DetectabilityRiskFactorDetails from './details/DetectabilityRiskFactorDetails'

const RiskFactorResume = () => {
  const {
    selectedVessel
  } = useSelector(state => state.vessel)

  const [riskFactorExplanationIsOpen, setRiskFactorExplanationIsOpen] = useState(false)
  const [impactRiskFactorIsOpen, setImpactRiskFactorIsOpen] = useState(false)
  const [probabilityRiskFactorIsOpen, setProbabilityRiskFactorIsOpen] = useState(false)
  const [detectabilityRiskFactorIsOpen, setDetectabilityRiskFactorIsOpen] = useState(false)

  return (
    <>
      {
        selectedVessel?.riskFactor?.riskFactor
          ? <>
            <RiskFactorZone>
              <GlobalRiskFactor>Note de risque globale</GlobalRiskFactor>
              <GlobalRisk data-cy={'global-risk-factor'}>
                <RiskFactorCursor
                  height={24}
                  isBig={true}
                  value={parseFloat(selectedVessel?.riskFactor?.riskFactor).toFixed(1)}
                  color={getRiskFactorColor(selectedVessel?.riskFactor?.riskFactor)}
                  progress={100 * selectedVessel?.riskFactor?.riskFactor / 4}
                  underCharter={selectedVessel.underCharter}
                />
                <GlobalText underCharter={selectedVessel.underCharter}>
                  <SeeMore
                    underCharter={selectedVessel.underCharter}
                    data-cy={'show-risk-factor-explanation-modal'}
                    onClick={() => setRiskFactorExplanationIsOpen(true)}
                  >
                    En savoir plus
                  </SeeMore>
                  {
                    selectedVessel.underCharter
                      ? <UnderCharterText>navire sous charte</UnderCharterText>
                      : null
                  }
                </GlobalText>
              </GlobalRisk>
              <Line/>
              <SubRisk
                data-cy={'impact-risk-factor'}
                onClick={() => setImpactRiskFactorIsOpen(!impactRiskFactorIsOpen)}
              >
                <SubRiskHeader>
                  <SubRiskTitle>
                    Impact sur la ressource
                  </SubRiskTitle>
                  <Chevron $isOpen={impactRiskFactorIsOpen}/>
                </SubRiskHeader>
                <RiskFactorImpact/>
                <RiskFactorCursor
                  height={8}
                  value={parseFloat(selectedVessel?.riskFactor?.impactRiskFactor).toFixed(1)}
                  color={getRiskFactorColor(selectedVessel?.riskFactor?.impactRiskFactor)}
                  progress={100 * selectedVessel?.riskFactor?.impactRiskFactor / 4}
                />
                <SubRiskText title={getImpactRiskFactorText(selectedVessel?.riskFactor?.impactRiskFactor, selectedVessel?.riskFactor?.segmentHighestImpact)}>
                  {getImpactRiskFactorText(selectedVessel?.riskFactor?.impactRiskFactor, selectedVessel?.riskFactor?.segmentHighestImpact)}
                </SubRiskText>
              </SubRisk>
              <ImpactRiskFactorDetails isOpen={impactRiskFactorIsOpen}/>
              <Line/>
              <SubRisk
                data-cy={'probability-risk-factor'}
                onClick={() => setProbabilityRiskFactorIsOpen(!probabilityRiskFactorIsOpen)}
              >
                <SubRiskHeader>
                  <SubRiskTitle>
                    Probabilité d&apos;infraction
                  </SubRiskTitle>
                  <Chevron $isOpen={probabilityRiskFactorIsOpen}/>
                </SubRiskHeader>
                <RiskFactorInfractions/>
                <RiskFactorCursor
                  height={8}
                  value={parseFloat(selectedVessel?.riskFactor?.probabilityRiskFactor).toFixed(1)}
                  color={getRiskFactorColor(selectedVessel?.riskFactor?.probabilityRiskFactor)}
                  progress={100 * selectedVessel?.riskFactor?.probabilityRiskFactor / 4}
                />
                <SubRiskText title={getProbabilityRiskFactorText(selectedVessel?.riskFactor?.probabilityRiskFactor, selectedVessel?.riskFactor?.numberControlsLastFiveYears)}>
                  {getProbabilityRiskFactorText(selectedVessel?.riskFactor?.probabilityRiskFactor, selectedVessel?.riskFactor?.numberControlsLastFiveYears)}
                </SubRiskText>
              </SubRisk>
              <ProbabilityRiskFactorDetails isOpen={probabilityRiskFactorIsOpen}/>
              <Line/>
              <SubRisk
                data-cy={'detectability-risk-factor'}
                onClick={() => setDetectabilityRiskFactorIsOpen(!detectabilityRiskFactorIsOpen)}
              >
                <SubRiskHeader>
                  <SubRiskTitle>
                    Priorité de contrôle
                  </SubRiskTitle>
                  <Chevron $isOpen={detectabilityRiskFactorIsOpen}/>
                </SubRiskHeader>
                <RiskFactorControl/>
                <RiskFactorCursor
                  height={8}
                  value={parseFloat(selectedVessel?.riskFactor?.detectabilityRiskFactor).toFixed(1)}
                  color={getRiskFactorColor(selectedVessel?.riskFactor?.detectabilityRiskFactor)}
                  progress={100 * selectedVessel?.riskFactor?.detectabilityRiskFactor / 4}
                />
                <SubRiskText title={getDetectabilityRiskFactorText(selectedVessel?.riskFactor?.detectabilityRiskFactor, true)}>
                  {getDetectabilityRiskFactorText(selectedVessel?.riskFactor?.detectabilityRiskFactor, true)}
                </SubRiskText>
              </SubRisk>
              <DetectabilityRiskFactorDetails isOpen={detectabilityRiskFactorIsOpen}/>
            </RiskFactorZone>
            <RiskFactorExplanationModal
              isOpen={riskFactorExplanationIsOpen}
              setIsOpen={setRiskFactorExplanationIsOpen}
            />
          </>
          : <NoRiskFactor>Ce navire n&apos;a pas de note de risque</NoRiskFactor>
      }
    </>
  )
}

const GlobalText = styled.div`
  ${props => props.underCharter
  ? `
  width: 100%;
  display: inline-block;
  `
  : null}
`

const UnderCharterText = styled.span`
  color: ${COLORS.mediumSeaGreen};
  font-size: 13px;
  font-weight: 500;
  margin-left: 9px;
  line-height: 39px;
`

const NoRiskFactor = styled.div`
  margin: 5px 5px 10px 5px;
  padding: 10px 10px 10px 25px;
  text-align: left;
  background: ${COLORS.background};
  font-size: 15px;
  color: ${COLORS.slateGray};
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

const SeeMore = styled.a`
  font-size: 11px;
  color: ${COLORS.slateGray};
  text-decoration: underline;
  cursor: pointer;
  margin-top: ${props => props.underCharter ? -20 : 19}px;
  margin-right: ${props => props.underCharter ? 25 : 12}px;
  ${props => props.underCharter
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
  margin: 10px 10px 10px 10px;
  padding-top: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.background};
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
  border-bottom: 1px solid ${COLORS.lightGray};
`

const GlobalRiskFactor = styled.span`
  padding-left: 35px;
  font-size: 15px;
  color: ${COLORS.slateGray};
  width: 100%;
`

const SubRiskTitle = styled.div`
  font-size: 13px;
  color: ${COLORS.slateGray};
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

export default RiskFactorResume
