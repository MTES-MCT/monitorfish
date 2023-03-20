import { MultiSelect } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { useGetFleetSegmentsQuery } from '../../../../../api/fleetSegment'
import { FrontendError } from '../../../../../libs/FrontendError'
import { useNewWindow } from '../../../../../ui/NewWindow'
import { FieldsetGroupSpinner } from '../../shared/FieldsetGroup'

import type { MissionAction } from '../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export type FleetSegmentsFieldProps = {
  label: string
}
export function FleetSegmentsField({ label }: FleetSegmentsFieldProps) {
  const [input, , helper] = useField<MissionActionFormValues['segments']>('segments')

  const { newWindowContainerRef } = useNewWindow()

  const getFleetSegmentsApiQuery = useGetFleetSegmentsQuery()

  const fleetSegmentsAsMissionActionFleetSegments: MissionAction.FleetSegment[] | undefined = useMemo(() => {
    if (!getFleetSegmentsApiQuery.data) {
      return []
    }

    return getFleetSegmentsApiQuery.data.map(({ faoAreas, segment, segmentName }) => ({
      faoAreas: faoAreas || [],
      segment,
      segmentName: segmentName || undefined
    }))
  }, [getFleetSegmentsApiQuery.data])

  const initialValue: number[] | undefined = useMemo(
    () => {
      if (!fleetSegmentsAsMissionActionFleetSegments || !input.value) {
        return undefined
      }

      return input.value
        .map(missionActionFleetSegment =>
          fleetSegmentsAsMissionActionFleetSegments.findIndex(
            fleetSegment =>
              fleetSegment.segment === missionActionFleetSegment.segment &&
              fleetSegment.segmentName === missionActionFleetSegment.segmentName
          )
        )
        .filter((fleetSegmentIndex): fleetSegmentIndex is number => !!fleetSegmentIndex)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fleetSegmentsAsMissionActionFleetSegments]
  )

  const fleetSegmentsAsOptions: Array<Option<number>> = useMemo(() => {
    if (!fleetSegmentsAsMissionActionFleetSegments) {
      return []
    }

    return fleetSegmentsAsMissionActionFleetSegments.map(({ segment, segmentName }, index) => ({
      label: `${segment} - ${segmentName}`,
      value: index
    }))
  }, [fleetSegmentsAsMissionActionFleetSegments])

  const handleChange = useCallback(
    (nextFleetSegmentIndexes: number[] | undefined) => {
      if (!fleetSegmentsAsMissionActionFleetSegments) {
        throw new FrontendError('`fleetSegmentsAsMissionActionFleetSegments` is undefined. This should never happen.')
      }

      if (nextFleetSegmentIndexes === undefined) {
        helper.setValue(undefined)

        return
      }

      const nextFleetSegments: MissionAction.FleetSegment[] = nextFleetSegmentIndexes
        .map(index => fleetSegmentsAsMissionActionFleetSegments[index])
        .filter((fleetSegment): fleetSegment is MissionAction.FleetSegment => !!fleetSegment)

      helper.setValue(nextFleetSegments)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fleetSegmentsAsMissionActionFleetSegments, input.value]
  )

  if (!getFleetSegmentsApiQuery.data) {
    return <FieldsetGroupSpinner legend={label} />
  }

  return (
    <Box>
      <MultiSelect
        baseContainer={newWindowContainerRef.current}
        defaultValue={initialValue}
        isLight
        label={label}
        name="newFleetSegment"
        onChange={handleChange as any}
        options={fleetSegmentsAsOptions}
        virtualized
      />
    </Box>
  )
}

const Box = styled.div`
  width: 312px;
  .rs-picker-toggle {
    max-width: 312px;
  }

  div[role='option'] {
    > .rs-check-item {
      > .rs-checkbox-checker {
        > label {
          font-size: 13px;
          line-height: 1.3846;
          overflow: hidden;
          padding: 8px 12px 8px 38px;
          text-overflow: ellipsis;
          white-space: nowrap;

          > .rs-checkbox-wrapper {
            left: 12px;
            top: 10px !important;
          }
        }
      }
    }
  }
`
