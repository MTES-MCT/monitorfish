import { Field, Label, SingleTag, TagGroup } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useField } from 'formik'
import { remove as ramdaRemove, uniq } from 'ramda'
import { useCallback, useEffect, useMemo } from 'react'

import { useGetFleetSegmentsQuery } from '../../../../../api/fleetSegment'
import { useGetRiskFactorQuery } from '../../../../../api/vessel'
import { getFaoZonesFromSpeciesOnboard } from '../../../../../domain/entities/vessel/riskFactor'
import { getFleetSegments } from '../../../../../domain/use_cases/vessel/getFleetSegments'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { FrontendError } from '../../../../../libs/FrontendError'
import { sortByAscendingValue } from '../../../../../utils/sortByAscendingValue'
import { FieldsetGroup, FieldsetGroupSpinner } from '../../shared/FieldsetGroup'

import type { DeclaredLogbookSpecies } from '../../../../../domain/entities/vessel/types'
import type { MissionAction } from '../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export type VesselFleetSegmentsFieldProps = {
  label: string
}
export function VesselFleetSegmentsField({ label }: VesselFleetSegmentsFieldProps) {
  const dispatch = useMainAppDispatch()

  // Fields
  const [{ value: segmentsValue }, , segmentsHelper] = useField<MissionActionFormValues['segments']>('segments')
  const [{ value: faoAreasValue }, , faoAreasHelper] = useField<MissionActionFormValues['faoAreas']>('faoAreas')

  // Other fields controlling this field
  const [{ value: internalReferenceNumber }] =
    useField<MissionActionFormValues['internalReferenceNumber']>('internalReferenceNumber')
  const riskFactorApiQuery = useGetRiskFactorQuery(internalReferenceNumber || skipToken)
  const [{ value: gearOnBoard }] = useField<MissionActionFormValues['gearOnboard']>('gearOnboard')
  const [{ value: speciesOnboard }] = useField<MissionActionFormValues['speciesOnboard']>('speciesOnboard')
  const [{ value: longitude }] = useField<MissionActionFormValues['longitude']>('longitude')
  const [{ value: latitude }] = useField<MissionActionFormValues['latitude']>('latitude')

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

  useEffect(
    () => {
      if (faoAreasValue?.length) {
        return
      }

      if (!internalReferenceNumber) {
        return
      }

      if (!riskFactorApiQuery.data) {
        return
      }

      const declaredSpeciesOnboard: DeclaredLogbookSpecies[] = riskFactorApiQuery.data.speciesOnboard
      const faoAreas = getFaoZonesFromSpeciesOnboard(declaredSpeciesOnboard || [])

      faoAreasHelper.setValue(faoAreas)
    },

    // We observe `internalReferenceNumber` changes in order to update the faoAreas
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [internalReferenceNumber, riskFactorApiQuery]
  )

  useEffect(() => {
    if (segmentsValue?.length) {
      return
    }

    const getFleetSegmentsAsync = async () => {
      const declaredSpeciesOnboard = riskFactorApiQuery.data?.speciesOnboard

      // TODO Add the port Locode
      const computedFleetSegments = await dispatch(
        getFleetSegments(declaredSpeciesOnboard, gearOnBoard, speciesOnboard, longitude, latitude, undefined)
      )

      const nextFleetSegments = fleetSegmentsAsOptions
        .filter(({ value }) => computedFleetSegments?.find(fleetSegment => fleetSegment.segment === value.segment))
        .map(({ value }) => value)

      segmentsHelper.setValue(nextFleetSegments)
    }

    getFleetSegmentsAsync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, fleetSegmentsAsOptions, gearOnBoard, speciesOnboard, longitude, latitude, riskFactorApiQuery])

  const removeFaoArea = useCallback(
    (faoAreaToDelete: string) => {
      const nextFaoAreas = faoAreasValue?.filter(faoArea => faoArea !== faoAreaToDelete) || []

      faoAreasHelper.setValue(nextFaoAreas)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [faoAreasValue]
  )

  const removeFleetSegment = useCallback(
    (fleetSegmentIndex: number | undefined) => {
      if (!segmentsValue) {
        throw new FrontendError('`segments` is undefined')
      }

      if (fleetSegmentIndex === undefined) {
        throw new FrontendError('`fleetSegmentIndex` is undefined')
      }

      const nextFleetSegments = ramdaRemove(fleetSegmentIndex, 1, segmentsValue)
      const normalizedNextSegments = nextFleetSegments.length > 0 ? nextFleetSegments : undefined

      segmentsHelper.setValue(normalizedNextSegments)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [segmentsValue]
  )

  const faoAreaTags = useMemo(() => {
    if (!faoAreasValue) {
      return []
    }

    const faoAreas = sortByAscendingValue(uniq(faoAreasValue))

    return faoAreas.map(faoArea => (
      <SingleTag key={faoArea} onDelete={() => removeFaoArea(faoArea)}>
        {faoArea}
      </SingleTag>
    ))
  }, [faoAreasValue, removeFaoArea])

  const fleetSegmentTags = useMemo(
    () =>
      segmentsValue
        ? segmentsValue.map(({ segment, segmentName }, index) => (
            <SingleTag
              key={segment}
              onDelete={() => removeFleetSegment(index)}
            >{`${segment} - ${segmentName}`}</SingleTag>
          ))
        : [],
    [segmentsValue, removeFleetSegment]
  )

  if (isLoading) {
    return <FieldsetGroupSpinner isLight legend={label} />
  }

  return (
    <FieldsetGroup isLight legend={label}>
      {(!segmentsValue || !segmentsValue.length) && (
        <p>
          <em>
            Renseignez un point de contrôle, les engins utilisés et les espèce pêchées pour qu’un segment de flotte soit
            attribué au navire.
          </em>
        </p>
      )}

      {segmentsValue && segmentsValue.length > 0 && (
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
