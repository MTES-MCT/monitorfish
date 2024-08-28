import { VesselRiskFactor } from '@features/Vessel/components/VesselRiskFactor'
import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { PriorNotification } from '../../PriorNotification.types'
import { FixedTag } from '../PriorNotificationList/styles'
import { getColorsFromState } from '../PriorNotificationList/utils'

import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

type TagBarProps = Readonly<{
  hasBeenComputed?: boolean | undefined
  isInvalidated: boolean | undefined
  isVesselUnderCharter: boolean | undefined
  isZeroNotice: boolean | undefined
  riskFactor: number | undefined
  state: PriorNotification.State | undefined
  tripSegments: LogbookMessage.Segment[] | undefined
  types: PriorNotification.Type[] | undefined
}>
export function TagBar({
  hasBeenComputed = true,
  isInvalidated,
  isVesselUnderCharter,
  isZeroNotice,
  riskFactor,
  state,
  tripSegments,
  types
}: TagBarProps) {
  return (
    <Wrapper className="Wrapper" data-cy="PriorNotificationCard-TagBar">
      <Row>
        {!!riskFactor && (
          <VesselRiskFactor
            hasVesselRiskFactorSegments={tripSegments ? tripSegments.length > 0 : undefined}
            isVesselUnderCharter={isVesselUnderCharter}
            vesselRiskFactor={riskFactor}
          />
        )}

        {tripSegments?.map(tripSegment => (
          <FixedTag key={`tripSegment-${tripSegment.code}`} $isFullWidth backgroundColor={THEME.color.blueGray25}>
            {`${tripSegment.code} – ${tripSegment.name}`}
          </FixedTag>
        ))}
        {hasBeenComputed && !tripSegments?.length && (
          <FixedTag
            backgroundColor={THEME.color.white}
            borderColor={THEME.color.lightGray}
            color={THEME.color.slateGray}
          >
            Aucun segment
          </FixedTag>
        )}
      </Row>

      <Row>
        {isInvalidated && (
          <FixedTag backgroundColor={THEME.color.maximumRed} color={THEME.color.white}>
            Invalidé
          </FixedTag>
        )}
        {!isInvalidated && !!state && (
          <FixedTag
            key="state"
            $isFullWidth
            backgroundColor={getColorsFromState(state).backgroundColor}
            borderColor={getColorsFromState(state).borderColor}
            color={getColorsFromState(state).color}
            title={PriorNotification.STATE_LABEL[state]}
          >
            {PriorNotification.STATE_LABEL[state]}
          </FixedTag>
        )}

        {isZeroNotice && (
          <FixedTag key="zeroNotice" borderColor={THEME.color.slateGray}>
            Préavis Zéro
          </FixedTag>
        )}

        {types?.map(
          type =>
            type.hasDesignatedPorts && (
              <FixedTag key={`type-${type.name}`} $isFullWidth backgroundColor={THEME.color.gainsboro}>
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
  flex-flow: row wrap;
  gap: 8px;
`
