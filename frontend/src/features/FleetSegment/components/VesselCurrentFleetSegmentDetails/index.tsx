import { useGetGearsQuery } from '@api/gear'
import { useGetFleetSegmentsQuery } from '@features/FleetSegment/apis'
import {
  getFaoZones,
  getGearsWithNames,
  getTargetSpeciesIncludedInSegments
} from '@features/FleetSegment/components/VesselCurrentFleetSegmentDetails/utils'
import { SpeciesTypeToSpeciesTypeLabel } from '@features/FleetSegment/constants'
import { FlatKeyValue } from '@features/Vessel/components/VesselSidebar/common/FlatKeyValue'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { pluralize } from '@mtes-mct/monitor-ui'
import { type ForwardedRef, forwardRef, useMemo } from 'react'
import styled from 'styled-components'

import type { FleetSegment } from '@features/FleetSegment/types'

type VesselCurrentFleetSegmentDetailsProps = Readonly<{
  className?: string | undefined
}>
function VesselCurrentFleetSegmentDetailsWithRef(
  { className }: VesselCurrentFleetSegmentDetailsProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const { data: gearsReferential } = useGetGearsQuery()
  const { data: fleetSegmentsReferential } = useGetFleetSegmentsQuery()
  const riskFactor = selectedVessel?.riskFactor

  const fleetSegments: FleetSegment[] =
    riskFactor?.segments
      ?.map(fleetSegmentsCode =>
        fleetSegmentsReferential?.find(segmentFromReferential => segmentFromReferential.segment === fleetSegmentsCode)
      )
      ?.filter(segment => !!segment) ?? []

  const isFleetSegmentSpecifyingMeshSize = !!fleetSegments.find(
    fleetSegment => !!fleetSegment.minMesh || !!fleetSegment.maxMesh
  )
  const mainScipSpeciesType = fleetSegments.find(
    fleetSegment => !!fleetSegment.mainScipSpeciesType
  )?.mainScipSpeciesType

  const targetSpeciesIncludedInSegments = getTargetSpeciesIncludedInSegments(riskFactor, fleetSegments)
  const gearsWithName = getGearsWithNames(gearsReferential, riskFactor)
  const numberOfGears = gearsWithName?.length ?? 0
  const faoZones = getFaoZones(riskFactor)

  const columns = useMemo(() => {
    let baseColumns = [
      {
        key: `${pluralize('Zone', faoZones.length)} de la marée`,
        value: faoZones.length > 0 ? faoZones.join(', ') : undefined
      },
      {
        hasMultipleLines: true,
        key: `${pluralize('Engin', numberOfGears)} de la marée (FAR)`,
        value: gearsWithName?.length ? (
          <>
            {gearsWithName?.map(gear => (
              <ValueWithLineBreak key={gear.gear}>
                {gear.gearName} ({gear.gear})
              </ValueWithLineBreak>
            ))}
          </>
        ) : undefined
      }
    ]

    if (isFleetSegmentSpecifyingMeshSize) {
      baseColumns = baseColumns.concat({
        hasMultipleLines: true,
        key: `Maillage ${pluralize('de', numberOfGears)} ${numberOfGears === 1 ? "l'" : ''}${pluralize('engin', numberOfGears)}`,
        value: (
          <>
            {gearsWithName?.map(gear => (
              <ValueWithLineBreak key={gear.gear}>
                {gear.mesh ? <>{gear.mesh} mm</> : <NoValue>-</NoValue>} ({gear.gear})
              </ValueWithLineBreak>
            ))}
          </>
        )
      })
    }

    if (mainScipSpeciesType) {
      baseColumns = baseColumns.concat({
        key: "Majorité d'espèces à bord",
        value: SpeciesTypeToSpeciesTypeLabel[mainScipSpeciesType]
      })
    }

    if (targetSpeciesIncludedInSegments) {
      baseColumns = baseColumns.concat({
        key: 'Espèces cibles à bord',
        value: targetSpeciesIncludedInSegments
      })
    }

    return baseColumns
  }, [
    faoZones,
    numberOfGears,
    mainScipSpeciesType,
    isFleetSegmentSpecifyingMeshSize,
    targetSpeciesIncludedInSegments,
    gearsWithName
  ])

  return <FlatKeyValue ref={ref} className={className} column={columns} keyWidth={170} />
}

export const VesselCurrentFleetSegmentDetails = forwardRef<HTMLDivElement, VesselCurrentFleetSegmentDetailsProps>(
  VesselCurrentFleetSegmentDetailsWithRef
)

const ValueWithLineBreak = styled.div`
  font-size: 13px;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
`
