import { useGetFleetSegmentsQuery } from '@features/FleetSegment/apis'
import { Accent, Field, Label, SingleTag, Tag, TagGroup } from '@mtes-mct/monitor-ui'
import { sortByAscendingValue } from '@utils/sortByAscendingValue'
import { useFormikContext } from 'formik'
import { uniq } from 'ramda'
import { useMemo } from 'react'
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

  const fleetSegmentTags = values.segments
    ? values.segments.map(({ segment, segmentName }) => (
        <Tag key={segment} accent={Accent.PRIMARY}>{`${segment} - ${segmentName}`}</Tag>
      ))
    : []

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
              <StyledTagGroup>{faoAreaTags()}</StyledTagGroup>
            </Field>
          )}

          {fleetSegmentTags.length > 0 && (
            <Field>
              <Label>Segment de flotte de la marée</Label>
              <StyledTagGroup>{fleetSegmentTags}</StyledTagGroup>
            </Field>
          )}
        </>
      )}
    </FieldsetGroup>
  )
}

const StyledTagGroup = styled(TagGroup)`
  padding-top: 8px;
`

const Helper = styled.p`
  color: #ff3392;
  font-style: italic;
`
