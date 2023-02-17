import { Field, Label, Select, SingleTag, TagGroup } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { remove as ramdaRemove, update } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useGetFleetSegmentsQuery } from '../../../../../api/fleetSegment'
import { getFaoZonesFromSpeciesOnboard } from '../../../../../domain/entities/vessel/riskFactor'
import { getVesselRiskFactor } from '../../../../../domain/use_cases/vessel/getVesselRiskFactor'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { FrontendError } from '../../../../../libs/FrontendError'
import { useNewWindow } from '../../../../../ui/NewWindow'
import { includesSome } from '../../../../../utils/includesSome'
import { FieldsetGroup } from '../../FieldsetGroup'

import type { MissionAction } from '../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export function FleetSegmentsField() {
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

      const nextSegments: MissionAction.FleetSegment[] = [...(input.value || []), newSegment]

      helper.setValue(nextSegments)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const remove = useCallback(
    (index: number, faoArea?: string) => {
      if (!input.value) {
        throw new FrontendError('`input.value` is undefined. This should never happen.', 'remove()')
      }

      // If we only wish to delete an faoArea from an existing fleet segment
      if (faoArea) {
        const foundSegment = input.value[index]
        if (!foundSegment) {
          throw new FrontendError('`foundSegment` is undefined. This should never happen.', 'remove()')
        }

        const updatedSegment: MissionAction.FleetSegment = {
          ...foundSegment,
          faoAreas: foundSegment.faoAreas.filter(segmentFaoArea => segmentFaoArea !== faoArea)
        }

        const nextSegments = update(index, updatedSegment, input.value)

        helper.setValue(nextSegments)

        return
      }

      const nextSegments = ramdaRemove(index, 1, input.value)
      const nornalizedNextSegments = nextSegments.length > 0 ? nextSegments : undefined

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
    [updateDefaultFleetSegments, internalReferenceNumber]
  )

  const faoAreaTags = useMemo(
    () =>
      input.value
        ? input.value
            .map(({ faoAreas }, fleetSegmentIndex) =>
              faoAreas.map(faoArea => (
                <SingleTag key={faoArea} onDelete={() => remove(fleetSegmentIndex, faoArea)}>
                  {faoArea}
                </SingleTag>
              ))
            )
            .flat()
        : [],
    [input.value, remove]
  )

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
    return <>Loading...</>
  }

  return (
    <FieldsetGroup isLight legend="Segment de flotte">
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
        name="newFleetSegment.name"
        onChange={add}
        options={fleetSegmentsAsOptions}
        virtualized
      />
    </FieldsetGroup>
  )
}
