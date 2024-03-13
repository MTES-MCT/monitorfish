import { useGetFleetSegmentsQuery } from '@features/FleetSegment/apis'
import { FrontendError } from '@libs/FrontendError'
import { Field, Label, SingleTag, TagGroup } from '@mtes-mct/monitor-ui'
import { sortByAscendingValue } from '@utils/sortByAscendingValue'
import { useFormikContext } from 'formik'
import { remove as ramdaRemove, uniq } from 'ramda'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { useGetMissionActionFormikUsecases } from '../../hooks/useGetMissionActionFormikUsecases'
import { FieldsetGroup, FieldsetGroupSpinner } from '../../shared/FieldsetGroup'

import type { MissionActionFormValues } from '../../types'

type VesselFleetSegmentsFieldProps = Readonly<{
  label: string
}>
export function VesselFleetSegmentsField({ label }: VesselFleetSegmentsFieldProps) {
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()
  const { updateSegments } = useGetMissionActionFormikUsecases()

  const getFleetSegmentsApiQuery = useGetFleetSegmentsQuery()

  const isLoading = useMemo(() => !getFleetSegmentsApiQuery.data, [getFleetSegmentsApiQuery.data])

  const removeFaoArea = (faoAreaToDelete: string) => {
    const nextFaoAreas = values.faoAreas?.filter(faoArea => faoArea !== faoAreaToDelete) ?? []

    setFieldValue('faoAreas', nextFaoAreas)
    updateSegments({ ...values, faoAreas: nextFaoAreas })
  }

  const removeFleetSegment = useCallback(
    (fleetSegmentIndex: number | undefined) => {
      if (!values.segments) {
        throw new FrontendError('`segments` is undefined')
      }

      if (fleetSegmentIndex === undefined) {
        throw new FrontendError('`fleetSegmentIndex` is undefined')
      }

      const nextFleetSegments = ramdaRemove(fleetSegmentIndex, 1, values.segments)
      const normalizedNextSegments = nextFleetSegments.length > 0 ? nextFleetSegments : undefined

      setFieldValue('segments', normalizedNextSegments)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values.segments]
  )

  const faoAreaTags = () => {
    if (!values.faoAreas) {
      return []
    }

    const faoAreas = sortByAscendingValue(uniq(values.faoAreas))

    return faoAreas.map(faoArea => (
      <SingleTag key={faoArea} onDelete={() => removeFaoArea(faoArea)}>
        {faoArea}
      </SingleTag>
    ))
  }

  const fleetSegmentTags = useMemo(
    () =>
      values.segments
        ? values.segments.map(({ segment, segmentName }, index) => (
            <SingleTag
              key={segment}
              onDelete={() => removeFleetSegment(index)}
            >{`${segment} - ${segmentName}`}</SingleTag>
          ))
        : [],
    [values.segments, removeFleetSegment]
  )

  if (isLoading) {
    return <FieldsetGroupSpinner isLight legend={label} />
  }

  return (
    <FieldsetGroup isLight legend={label}>
      {(!values.segments || !values.segments.length) && (
        <Helper>
          Renseignez un point de contrôle, les engins utilisés et les espèce pêchées pour qu’un segment de flotte soit
          attribué au navire.
        </Helper>
      )}

      {values.segments && values.segments.length > 0 && (
        <>
          {faoAreaTags.length > 0 && (
            <Field>
              <Label>Zones de pêche de la marée (issues des FAR)</Label>
              <TagGroup>{faoAreaTags()}</TagGroup>
            </Field>
          )}

          {fleetSegmentTags.length > 0 && (
            <Field>
              <Label>Segment de flotte de la marée</Label>
              <TagGroup>{fleetSegmentTags}</TagGroup>
            </Field>
          )}
        </>
      )}
    </FieldsetGroup>
  )
}

const Helper = styled.p`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
`
