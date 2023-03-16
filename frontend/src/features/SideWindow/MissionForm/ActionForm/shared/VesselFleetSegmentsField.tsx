import { Field, Label, Select, SingleTag, TagGroup } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { remove as ramdaRemove, uniq } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useGetFleetSegmentsQuery } from '../../../../../api/fleetSegment'
import { getFaoZonesFromSpeciesOnboard } from '../../../../../domain/entities/vessel/riskFactor'
import { getVesselRiskFactor } from '../../../../../domain/use_cases/vessel/getVesselRiskFactor'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { FrontendError } from '../../../../../libs/FrontendError'
import { useNewWindow } from '../../../../../ui/NewWindow'
import { includesSome } from '../../../../../utils/includesSome'
import { sortByAscendingValue } from '../../../../../utils/sortByAscendingValue'
import { FieldsetGroup, FieldsetGroupSpinner } from '../../shared/FieldsetGroup'

import type { MissionAction } from '../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export type VesselFleetSegmentsFieldProps = {
  label: string
}
export function VesselFleetSegmentsField({ label }: VesselFleetSegmentsFieldProps) {
  const [input, , helper] = useField<MissionActionFormValues['segments']>('segments')
  const [{ value: internalReferenceNumber }] =
    useField<MissionActionFormValues['internalReferenceNumber']>('internalReferenceNumber')

  const { newWindowContainerRef } = useNewWindow()

  const [isUpdatingDefaultFleetSegments, setIsUpdatingDefaultFleetSegments] = useState(false)

  const dispatch = useMainAppDispatch()
  const getFleetSegmentsApiQuery = useGetFleetSegmentsQuery()

  const fleetSegmentsAsOptions: Option<MissionAction.FleetSegment>[] = useMemo(() => {
    if (!getFleetSegmentsApiQuery.data) {
      return []
    }

    return getFleetSegmentsApiQuery.data.map(({ faoAreas, segment, segmentName }) => ({
      label: `${segment} - ${segmentName}`,
      value: {
        faoAreas: faoAreas || [],
        segment,
        segmentName: segmentName || undefined
      }
    }))
  }, [getFleetSegmentsApiQuery.data])

  const isLoading = useMemo(
    () => !getFleetSegmentsApiQuery.data || isUpdatingDefaultFleetSegments,
    [getFleetSegmentsApiQuery.data, isUpdatingDefaultFleetSegments]
  )

  const add = useCallback(
    (newSegment: MissionAction.FleetSegment | undefined) => {
      if (!newSegment) {
        throw new FrontendError('`newSegment` is undefined. This should never happen.', 'add()')
      }

      const nextFleetSegments: MissionAction.FleetSegment[] = [...(input.value || []), newSegment]

      helper.setValue(nextFleetSegments)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const remove = useCallback(
    (fleetSegmentIndex: number | undefined, faoArea?: string) => {
      if (!input.value) {
        throw new FrontendError('`input.value` is undefined. This should never happen.', 'remove()')
      }

      // If we only wish to delete a specific faoArea from existing fleet segments
      if (faoArea) {
        const nextFleetSegments = input.value.map(fleetSegment => ({
          ...fleetSegment,
          faoAreas: fleetSegment.faoAreas.filter(fleetSegmentFaoArea => fleetSegmentFaoArea !== faoArea)
        }))

        helper.setValue(nextFleetSegments)

        return
      }

      if (fleetSegmentIndex === undefined) {
        throw new FrontendError('`fleetSegmentIndex` is undefined. This should never happen.', 'remove()')
      }

      const nextFleetSegments = ramdaRemove(fleetSegmentIndex, 1, input.value)
      const nornalizedNextSegments = nextFleetSegments.length > 0 ? nextFleetSegments : undefined

      helper.setValue(nornalizedNextSegments)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const updateDefaultFleetSegments = useCallback(
    async (_internalReferenceNumber: string) => {
      setIsUpdatingDefaultFleetSegments(true)

      try {
        const riskFactor = await dispatch(getVesselRiskFactor(_internalReferenceNumber))
        const faoZones = getFaoZonesFromSpeciesOnboard(riskFactor.speciesOnboard)
        const includesSomeFaoZones = includesSome(faoZones)
        const defaultFleetSegments = fleetSegmentsAsOptions
          .filter(({ value }) => includesSomeFaoZones(value.faoAreas))
          .map(({ value }) => value)

        helper.setValue(defaultFleetSegments)
      } catch (_) {
        // If there is an error (because we didn't find a no risk factor), there is no need to update anything
      }

      setIsUpdatingDefaultFleetSegments(false)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, fleetSegmentsAsOptions]
  )

  useEffect(
    () => {
      if (!internalReferenceNumber) {
        return
      }

      updateDefaultFleetSegments(internalReferenceNumber)
    },

    // We observe `internalReferenceNumber` changes in order to update the default fleet segments
    [internalReferenceNumber, updateDefaultFleetSegments]
  )

  const faoAreaTags = useMemo(() => {
    if (!input.value) {
      return []
    }

    const allFaoAreas = input.value.map(({ faoAreas }) => faoAreas).flat()
    const faoAreas = sortByAscendingValue(uniq(allFaoAreas))

    return faoAreas.map(faoArea => (
      <SingleTag key={faoArea} onDelete={() => remove(undefined, faoArea)}>
        {faoArea}
      </SingleTag>
    ))
  }, [input.value, remove])

  const fleetSegmentTags = useMemo(
    () =>
      input.value
        ? input.value.map(({ segment, segmentName }, index) => (
            <SingleTag key={segment} onDelete={() => remove(index)}>{`${segment} - ${segmentName}`}</SingleTag>
          ))
        : [],
    [input.value, remove]
  )

  if (isLoading) {
    return <FieldsetGroupSpinner isLight legend={label} />
  }

  return (
    <FieldsetGroup isLight legend={label}>
      {(!input.value || !input.value.length) && (
        <p>
          <em>
            Renseignez un point de contrôle, les engins utilisés et les espèce pêchées pour qu’un segment de flotte soit
            attribué au navire.
          </em>
        </p>
      )}

      {input.value && input.value.length > 0 && (
        <>
          <Field>
            <Label>Zones de pêche de la marée (issues des FAR)</Label>
            <TagGroup>{faoAreaTags}</TagGroup>
          </Field>

          <Field>
            <Label>Segment de flotte de la marée</Label>
            <TagGroup>{fleetSegmentTags}</TagGroup>
          </Field>
        </>
      )}

      <Select
        key={String(input.value?.length)}
        baseContainer={newWindowContainerRef.current}
        label="Ajouter un segment"
        name="newFleetSegment"
        onChange={add}
        options={fleetSegmentsAsOptions}
        virtualized
      />
    </FieldsetGroup>
  )
}
