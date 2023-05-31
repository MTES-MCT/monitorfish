import { Field, Label, SingleTag, TagGroup } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useFormikContext } from 'formik'
import { remove as ramdaRemove, uniq } from 'ramda'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { useGetFleetSegmentsQuery } from '../../../../../api/fleetSegment'
import { useGetRiskFactorQuery } from '../../../../../api/vessel'
import { getFaoZonesFromSpeciesOnboard } from '../../../../../domain/entities/vessel/riskFactor'
import { getFleetSegments } from '../../../../../domain/use_cases/vessel/getFleetSegments'
import { useDeepCompareEffect } from '../../../../../hooks/useDeepCompareEffect'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { FrontendError } from '../../../../../libs/FrontendError'
import { sortByAscendingValue } from '../../../../../utils/sortByAscendingValue'
import { FieldsetGroup, FieldsetGroupSpinner } from '../../shared/FieldsetGroup'

import type { MissionAction } from '../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export type VesselFleetSegmentsFieldProps = {
  label: string
}
export function VesselFleetSegmentsField({ label }: VesselFleetSegmentsFieldProps) {
  const dispatch = useMainAppDispatch()

  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()
  const riskFactorApiQuery = useGetRiskFactorQuery(values.internalReferenceNumber || skipToken)

  const getFleetSegmentsApiQuery = useGetFleetSegmentsQuery()

  const fleetSegmentsAsOptions: Option<MissionAction.FleetSegment>[] = useMemo(() => {
    if (!getFleetSegmentsApiQuery.data) {
      return []
    }

    return getFleetSegmentsApiQuery.data.map(({ segment, segmentName }) => ({
      label: `${segment} - ${segmentName}`,
      value: {
        segment,
        segmentName: segmentName || undefined
      }
    }))
  }, [getFleetSegmentsApiQuery.data])

  const isLoading = useMemo(() => !getFleetSegmentsApiQuery.data, [getFleetSegmentsApiQuery.data])

  const updateSegments = useDebouncedCallback(async () => {
    const declaredSpeciesOnboard = riskFactorApiQuery.data?.speciesOnboard

    const computedFleetSegments = await dispatch(
      getFleetSegments(
        declaredSpeciesOnboard,
        values.gearOnboard,
        values.speciesOnboard,
        values.longitude,
        values.latitude,
        values.portLocode
      )
    )

    const nextFleetSegments = fleetSegmentsAsOptions
      .filter(({ value }) => computedFleetSegments?.find(fleetSegment => fleetSegment.segment === value.segment))
      .map(({ value }) => value)

    setFieldValue('segments', nextFleetSegments)
  }, 500)

  useDeepCompareEffect(
    () => {
      if (values.faoAreas?.length || !riskFactorApiQuery.data) {
        return
      }

      const declaredSpeciesOnboard = riskFactorApiQuery.data.speciesOnboard
      const faoAreas = getFaoZonesFromSpeciesOnboard(declaredSpeciesOnboard || [])

      setFieldValue('faoAreas', faoAreas)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [riskFactorApiQuery.data]
  )

  useDeepCompareEffect(() => {
    updateSegments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fleetSegmentsAsOptions,
    values.gearOnboard,
    values.speciesOnboard,
    values.longitude,
    values.latitude,
    values.portLocode,
    riskFactorApiQuery.data
  ])

  const removeFaoArea = useCallback(
    (faoAreaToDelete: string) => {
      const nextFaoAreas = values.faoAreas?.filter(faoArea => faoArea !== faoAreaToDelete) || []

      setFieldValue('faoAreas', nextFaoAreas)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values.faoAreas]
  )

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

  const faoAreaTags = useMemo(() => {
    if (!values.faoAreas) {
      return []
    }

    const faoAreas = sortByAscendingValue(uniq(values.faoAreas))

    return faoAreas.map(faoArea => (
      <SingleTag key={faoArea} onDelete={() => removeFaoArea(faoArea)}>
        {faoArea}
      </SingleTag>
    ))
  }, [values.faoAreas, removeFaoArea])

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
              <TagGroup>{faoAreaTags}</TagGroup>
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
