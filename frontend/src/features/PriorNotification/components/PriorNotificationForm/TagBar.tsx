import { VesselRiskFactor } from '@features/Vessel/components/VesselRiskFactor'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import { isZeroNotice } from './utils'
import { FixedTag } from '../PriorNotificationList/styles'

import type { FormValues } from './types'

export function TagBar() {
  const editedPriorNotificationComputedValues = useMainAppSelector(
    store => store.priorNotification.editedPriorNotificationComputedValues
  )
  const { values } = useFormikContext<FormValues>()

  return (
    <Wrapper className="Wrapper">
      {isZeroNotice(values) && (
        <FixedTag key="zeroNotice" borderColor={THEME.color.slateGray}>
          Préavis Zéro
        </FixedTag>
      )}

      {!!editedPriorNotificationComputedValues && (
        <>
          <Row className="Row">
            <VesselRiskFactor
              hasVesselRiskFactorSegments={editedPriorNotificationComputedValues.tripSegments.length > 0}
              // TODO We need to add that.
              isVesselUnderCharter={false}
              vesselRiskFactor={editedPriorNotificationComputedValues.vesselRiskFactor}
            />

            {editedPriorNotificationComputedValues.tripSegments.map(tripSegment => (
              <FixedTag key={`tripSegment-${tripSegment.code}`} backgroundColor={THEME.color.blueGray25}>
                {`${tripSegment.code} – ${tripSegment.name}`}
              </FixedTag>
            ))}
          </Row>

          <Row>
            {editedPriorNotificationComputedValues.types.map(
              type =>
                type.hasDesignatedPorts && (
                  <FixedTag key={`type-${type.name}`} backgroundColor={THEME.color.gainsboro}>
                    {type.name}
                  </FixedTag>
                )
            )}
          </Row>
        </>
      )}
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
