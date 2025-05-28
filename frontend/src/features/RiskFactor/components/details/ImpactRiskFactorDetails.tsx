import { FleetSegmentsWithTooltip } from '@features/FleetSegment/components/FleetSegmentsWithTooltip'
import { VesselCurrentFleetSegmentDetails } from '@features/FleetSegment/components/VesselCurrentFleetSegmentDetails'
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
      $elementHeight={currentFleetSegmentDetailsElementRef?.current?.clientHeight}
      $hasSegment={!!riskFactor.segmentHighestImpact}
      $isOpen={isOpen}
      $isRecentProfile={selectedVessel?.activityOrigin === ActivityOrigin.FROM_RECENT_PROFILE}
    >
      <Line />
      <Zone>
        {riskFactor.segmentHighestImpact ? (
          <>
            <Fields>
              <TableBody>
                <Field>
                  <Key>Segment de flotte</Key>
                  <Value>
                    <FleetSegmentsWithTooltip
                      activityOrigin={selectedVessel?.activityOrigin}
                      hasWhiteBackground
                      segments={[riskFactor.segmentHighestImpact]}
                    />
                  </Value>
                </Field>
              </TableBody>
            </Fields>
            {selectedVessel?.activityOrigin === ActivityOrigin.FROM_RECENT_PROFILE && (
              <NoCapture>Le navire n&apos;a pas fait de FAR</NoCapture>
            )}
            <VesselCurrentFleetSegmentDetails ref={currentFleetSegmentDetailsElementRef} />
            <Text>
              Si le navire appartient à plusieurs segments, c&apos;est celui dont la note d&apos;impact est la plus
              élevée qui est retenu.
            </Text>
          </>
        ) : (
          <Text>
            Ce navire n&apos;appartient à aucun segment de flotte, soit parce qu&apos;il n&apos;a pas encore envoyé les
            données de sa marée, soit parce qu&apos;aucun segment ne correspond à son activité.
          </Text>
        )}
      </Zone>
    </SubRiskDetails>
  )
}

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
  $elementHeight: number | undefined
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
          95 + (p.$elementHeight ? p.$elementHeight : 36) + (p.$isRecentProfile ? 34 : 0)
        : 80
      : 0}px;
  opacity: ${p => (p.$isOpen ? '1' : '0')};
  visibility: ${p => (p.$isOpen ? 'visible' : 'hidden')};
  overflow: hidden;
  transition: 0.2s all;
`

const TableBody = styled.tbody``

const Zone = styled.div`
  margin: 5px 5px 10px 16px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${p => p.theme.color.white};
`

const Fields = styled.table`
  display: table;
  margin: 10px 5px 0 16px;
  min-width: 40%;
  width: inherit;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${p => p.theme.color.slateGray};
  padding: 1px 5px 5px 0;
  line-height: 0.5em;
  font-weight: normal;
  width: 170px;
  text-align: left;
`

const Value = styled.td`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-weight: 500;
`

const Text = styled.div`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  text-align: left;
  font-weight: 500;
  margin: 4px 0 0 16px;
`
