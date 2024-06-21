import { VesselRiskFactor } from '@features/Vessel/components/VesselRiskFactor'
import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { PriorNotification } from '../../PriorNotification.types'
import { FixedTag } from '../PriorNotificationList/styles'
import { getColorsFromState } from '../PriorNotificationList/utils'

import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

type TagBarProps = Readonly<{
  isVesselUnderCharter: boolean | undefined
  isZeroNotice: boolean | undefined
  state: PriorNotification.State | undefined
  tripSegments: LogbookMessage.Segment[] | undefined
  types: PriorNotification.Type[] | undefined
  vesselRiskFactor: number | undefined
}>
export function TagBar({
  isVesselUnderCharter,
  isZeroNotice,
  state,
  tripSegments,
  types,
  vesselRiskFactor
}: TagBarProps) {
  return (
    <Wrapper className="Wrapper">
      <Row>
        {!!vesselRiskFactor && (
          <VesselRiskFactor
            hasVesselRiskFactorSegments={tripSegments ? tripSegments.length > 0 : undefined}
            isVesselUnderCharter={isVesselUnderCharter}
            vesselRiskFactor={vesselRiskFactor}
          />
        )}

        {tripSegments?.map(tripSegment => (
          <FixedTag key={`tripSegment-${tripSegment.code}`} backgroundColor={THEME.color.blueGray25}>
            {`${tripSegment.code} – ${tripSegment.name}`}
          </FixedTag>
        ))}
      </Row>

      <Row>
        {isZeroNotice && (
          <FixedTag key="zeroNotice" borderColor={THEME.color.slateGray}>
            Préavis Zéro
          </FixedTag>
        )}

        {!!state && (
          <FixedTag
            key="state"
            backgroundColor={getColorsFromState(state).backgroundColor}
            borderColor={getColorsFromState(state).borderColor}
            color={getColorsFromState(state).color}
          >
            {PriorNotification.STATE_LABEL[state]}
          </FixedTag>
        )}

        {types?.map(
          type =>
            type.hasDesignatedPorts && (
              <FixedTag key={`type-${type.name}`} backgroundColor={THEME.color.gainsboro}>
                {type.name}
              </FixedTag>
            )
        )}
      </Row>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
`
