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

const RiskFactorResume = ({ selectedVessel }) => {
  const [riskFactorExplanationIsOpen, setRiskFactorExplanationIsOpen] = useState(false)

  return (
    <>
      <RiskFactorZone>
        <GlobalRiskFactor>Note de risque globale</GlobalRiskFactor>
        <GlobalRisk>
          <RiskFactorCursor
            isBig={true}
            value={parseFloat(selectedVessel?.riskFactor).toFixed(1)}
            color={getRiskFactorColor(selectedVessel?.riskFactor)}
            progress={100 * selectedVessel?.riskFactor / 4}
          />
          <SeeMore onClick={() => setRiskFactorExplanationIsOpen(true)}>En savoir plus</SeeMore>
        </GlobalRisk>
        <Line/>
        <SubRisk>
          Impact sur la ressource
        </SubRisk>
        <RiskFactorImpact/>
        <RiskFactorCursor
          value={parseFloat(selectedVessel?.impactRiskFactor).toFixed(1)}
          color={getRiskFactorColor(selectedVessel?.impactRiskFactor)}
          progress={100 * selectedVessel?.impactRiskFactor / 4}
        />
        <SubRiskText title={getImpactRiskFactorText(selectedVessel?.impactRiskFactor)}>
          { getImpactRiskFactorText(selectedVessel?.impactRiskFactor) }
        </SubRiskText>
        <Line/>
        <SubRisk>
          Probabilité d&apos;infraction
        </SubRisk>
        <RiskFactorInfractions/>
        <RiskFactorCursor
          value={parseFloat(selectedVessel?.probabilityRiskFactor).toFixed(1)}
          color={getRiskFactorColor(selectedVessel?.probabilityRiskFactor)}
          progress={100 * selectedVessel?.probabilityRiskFactor / 4}
        />
        <SubRiskText title={getProbabilityRiskFactorText(selectedVessel?.probabilityRiskFactor)}>
          { getProbabilityRiskFactorText(selectedVessel?.probabilityRiskFactor) }
        </SubRiskText>
        <Line/>
        <SubRisk>
          Priorité de contrôle
        </SubRisk>
        <RiskFactorControl/>
        <RiskFactorCursor
          value={parseFloat(selectedVessel?.detectabilityRiskFactor).toFixed(1)}
          color={getRiskFactorColor(selectedVessel?.detectabilityRiskFactor)}
          progress={100 * selectedVessel?.detectabilityRiskFactor / 4}
        />
        <SubRiskText title={getDetectabilityRiskFactorText(selectedVessel?.detectabilityRiskFactor, true)}>
          { getDetectabilityRiskFactorText(selectedVessel?.detectabilityRiskFactor, true) }
        </SubRiskText>
      </RiskFactorZone>
      <RiskFactorExplanationModal
        isOpen={riskFactorExplanationIsOpen}
        setIsOpen={setRiskFactorExplanationIsOpen}
      />
      </>
  )
}

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
  margin-top: 19px;
  margin-right: 12px;
`

const RiskFactorZone = styled.div`
  margin: 5px 5px 10px 5px;
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

const SubRisk = styled.div`
  font-size: 13px;
  color: ${COLORS.slateGray};
  padding-left: 35px;
  margin-top: 8px;
  width: 100%;
`

const SubRiskText = styled.span`
  margin: 8px;
  max-width: 155px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  font-weight: 500;
`

export default RiskFactorResume
