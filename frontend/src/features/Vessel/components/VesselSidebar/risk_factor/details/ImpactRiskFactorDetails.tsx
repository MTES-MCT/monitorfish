import { VesselCurrentFleetSegmentDetails } from '@features/FleetSegment/components/VesselCurrentFleetSegmentDetails'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useRef } from 'react'
import styled from 'styled-components'

import InfoSVG from '../../../../../icons/Information.svg?react'

export function ImpactRiskFactorDetails({ isOpen }) {
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const currentFleetSegmentDetailsElementRef = useRef<HTMLDivElement>(null)
  const riskFactor = selectedVessel?.riskFactor

  return (
    <SubRiskDetails
      $elementHeight={currentFleetSegmentDetailsElementRef?.current?.clientHeight}
      $hasSegment={!!riskFactor?.segmentHighestImpact}
      $isOpen={isOpen}
    >
      <Line />
      <Zone>
        {riskFactor?.segmentHighestImpact ? (
          <>
            <Fields>
              <TableBody>
                <Field>
                  <Key>Segment de flotte actuel</Key>
                  <Value>
                    {riskFactor?.segmentHighestImpact}{' '}
                    <Info
                      title={
                        'La note de risque de ce segment est la note attribuée par la DIRM de la ' +
                        'façade dans son Plan de contrôle annuel.'
                      }
                    />
                  </Value>
                </Field>
              </TableBody>
            </Fields>
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

const Line = styled.div`
  width: 100%;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
`

const Info = styled(InfoSVG)<{
  $isInfoSegment?: boolean
}>`
  width: 14px;
  vertical-align: text-bottom;
  margin-bottom: 2px;
  margin-left: ${p => (p.$isInfoSegment ? '5px' : '2px')};
`

const SubRiskDetails = styled.div<{
  $elementHeight: number | undefined
  $hasSegment: boolean
  $isOpen: boolean
}>`
  width: 100%;
  height: ${p =>
    // eslint-disable-next-line no-nested-ternary
    p.$isOpen
      ? p.$hasSegment
        ? // eslint-disable-next-line no-nested-ternary
          95 + (p.$elementHeight ? p.$elementHeight : 36)
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
