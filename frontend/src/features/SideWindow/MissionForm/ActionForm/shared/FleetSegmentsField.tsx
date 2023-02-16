import { Field, Label, noop, Select, SingleTag, TagGroup } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
// import { includes } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useGetFleetSegmentsQuery } from '../../../../../api/fleetSegment'
import { getFaoZonesFromSpeciesOnboard } from '../../../../../domain/entities/vessel/riskFactor'
import { getVesselRiskFactor } from '../../../../../domain/use_cases/vessel/getVesselRiskFactor'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
// import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { useNewWindow } from '../../../../../ui/NewWindow'
import { includesSome } from '../../../../../utils/includesSome'
import { FieldsetGroup } from '../../FieldsetGroup'

import type { MissionAction } from '../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export function FleetSegmentsField() {
  const [input, , helper] = useField<MissionActionFormValues['segments']>('segments')
  const [{ value: vesselInternalReferenceNumber }] = useField<MissionActionFormValues['vesselInternalReferenceNumber']>(
    'vesselInternalReferenceNumber'
  )

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

  const faoAreaTags = useMemo(
    () =>
      input.value
        ? input.value
            .map(({ faoAreas }) => faoAreas)
            .flat()
            .map(faoArea => (
              <SingleTag key={faoArea} onDelete={noop}>
                {faoArea}
              </SingleTag>
            ))
        : [],
    [input.value]
  )

  const fleetSegmentTags = useMemo(
    () =>
      input.value
        ? input.value.map(({ segment, segmentName }) => (
            <SingleTag key={segment} onDelete={noop}>{`${segment} - ${segmentName}`}</SingleTag>
          ))
        : [],
    [input.value]
  )

  const add = useCallback(
    (newSegment: MissionAction.FleetSegment | undefined) => {
      if (!newSegment) {
        return
      }

      const nextSegments: MissionAction.FleetSegment[] = [...(input.value || []), newSegment]

      helper.setValue(nextSegments)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const updateDefaultFleetSegments = useCallback(
    async (_vesselInternalReferenceNumber: string) => {
      setIsUpdatingDefaultFleetSegments(true)

      try {
        const riskFactor = await dispatch(getVesselRiskFactor(_vesselInternalReferenceNumber))
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
      if (!vesselInternalReferenceNumber) {
        return
      }

      updateDefaultFleetSegments(vesselInternalReferenceNumber)
    },

    // We observe `vesselInternalReferenceNumber` changes in order to update the default fleet segments
    [updateDefaultFleetSegments, vesselInternalReferenceNumber]
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
