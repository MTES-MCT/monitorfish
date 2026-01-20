import { FleetSegmentsWithTooltip } from '@features/FleetSegment/components/FleetSegmentsWithTooltip'
import { VesselCurrentFleetSegmentDetails } from '@features/FleetSegment/components/VesselCurrentFleetSegmentDetails'
import { OpenedDetails } from '@features/RiskFactor/components/RiskFactorResume/common'
import { FlatKeyValue } from '@features/Vessel/components/VesselSidebar/components/common/FlatKeyValue'
import { ActivityOrigin } from '@features/Vessel/schemas/ActiveVesselSchema'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useRef } from 'react'
import styled from 'styled-components'

export function ImpactRiskFactorDetails({ isOpen }) {
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const riskFactor = selectedVessel?.riskFactor

  assertNotNullish(riskFactor)
  const currentFleetSegmentDetailsElementRef = useRef<HTMLDivElement>(null)

  return (
    <SubRiskDetails
      $currentSegmentsDetailsElementHeight={currentFleetSegmentDetailsElementRef?.current?.clientHeight}
      $hasSegment={!!riskFactor.segmentHighestImpact}
      $isOpen={isOpen}
      $isRecentProfile={selectedVessel?.activityOrigin === ActivityOrigin.FROM_RECENT_PROFILE}
    >
      <Line />
      <OpenedDetails>
        {riskFactor.segmentHighestImpact ? (
          <>
            <StyledFlatKeyValue
              column={[
                {
                  key: 'Segment de flotte',
                  value: (
                    <FleetSegmentsWithTooltip
                      activityOrigin={selectedVessel?.activityOrigin}
                      segments={[riskFactor.segmentHighestImpact]}
                    />
                  )
                }
              ]}
              keyWidth={170}
            />
            {selectedVessel?.activityOrigin === ActivityOrigin.FROM_RECENT_PROFILE && (
              <NoCapture>Le navire n&apos;a pas fait de FAR</NoCapture>
            )}
            <StyledVesselCurrentFleetSegmentDetails ref={currentFleetSegmentDetailsElementRef} />
            <Text $marginTop={12}>
              Si le navire appartient à plusieurs segments, c&apos;est celui dont la note d&apos;impact est la plus
              élevée qui est retenu.
            </Text>
          </>
        ) : (
          <Text $marginTop={0}>
            Ce navire n&apos;appartient à aucun segment de flotte, soit parce qu&apos;il n&apos;a pas encore envoyé les
            données de sa marée, soit parce qu&apos;aucun segment ne correspond à son activité.
          </Text>
        )}
      </OpenedDetails>
    </SubRiskDetails>
  )
}

const StyledVesselCurrentFleetSegmentDetails = styled(VesselCurrentFleetSegmentDetails)`
  table {
    margin: 0;
  }
`

const StyledFlatKeyValue = styled(FlatKeyValue)`
  table {
    margin: 0;
  }
  margin-bottom: 12px;
`

const NoCapture = styled.span`
  width: 100%;
  margin-left: 16px;
  margin-top: 8px;
  margin-bottom: 8px;
  font-style: italic;
  color: ${p => p.theme.color.slateGray};
`

const Line = styled.div`
  width: 100%;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
`

const SubRiskDetails = styled.div<{
  $currentSegmentsDetailsElementHeight: number | undefined
  $hasSegment: boolean
  $isOpen: boolean
  $isRecentProfile: boolean
}>`
  width: 100%;
  height: ${p =>
    // eslint-disable-next-line no-nested-ternary
    p.$isOpen
      ? p.$hasSegment
        ? // eslint-disable-next-line no-nested-ternary
          120 +
          (p.$currentSegmentsDetailsElementHeight ? p.$currentSegmentsDetailsElementHeight : 36) +
          (p.$isRecentProfile ? 45 : 0)
        : 90
      : 0}px;
  opacity: ${p => (p.$isOpen ? '1' : '0')};
  visibility: ${p => (p.$isOpen ? 'visible' : 'hidden')};
  overflow: hidden;
  transition: 0.2s all;
`

const Text = styled.div<{
  $marginTop: number
}>`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  text-align: left;
  font-weight: 500;
  margin-top: ${p => p.$marginTop}px;
`
