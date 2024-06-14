import { VesselRiskFactor } from '@features/Vessel/components/VesselRiskFactor'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME, Tag } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import { isZeroNotice } from './utils'

import type { FormValues } from './types'

export function TagBar() {
  const editedPriorNotificationComputedValues = useMainAppSelector(
    store => store.priorNotification.editedPriorNotificationComputedValues
  )
  const { values } = useFormikContext<FormValues>()

  return (
    <Wrapper className="Wrapper">
      {isZeroNotice(values) && (
        <Tag key="zeroNotice" borderColor={THEME.color.slateGray}>
          Préavis Zéro
        </Tag>
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
              <Tag key={`tripSegment-${tripSegment.code}`} backgroundColor={THEME.color.blueGray25}>
                {`${tripSegment.code} – ${tripSegment.name}`}
              </Tag>
            ))}
          </Row>

          <Row>
            {editedPriorNotificationComputedValues.types.map(
              type =>
                type.hasDesignatedPorts && (
                  <Tag key={`type-${type.name}`} backgroundColor={THEME.color.gainsboro}>
                    {type.name}
                  </Tag>
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
