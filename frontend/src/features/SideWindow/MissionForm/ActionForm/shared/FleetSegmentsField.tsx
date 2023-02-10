import { Field, Label, noop, Select, SingleTag, TagGroup } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useCallback, useEffect, useMemo } from 'react'

import { useGetFleetSegmentsQuery } from '../../../../../api/fleetSegment'
import { getFaoZonesFromSpeciesOnboard } from '../../../../../domain/entities/vessel/riskFactor'
import { getVesselRiskFactor } from '../../../../../domain/use_cases/vessel/getVesselRiskFactor'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
// import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { useNewWindow } from '../../../../../ui/NewWindow'
import { FieldsetGroup } from '../../FieldsetGroup'

import type { MissionAction } from '../../../../../domain/types/missionAction'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export function FleetSegmentsField() {
  const [input, , helper] = useField<MissionActionFormValues['segments']>('segments')

  const { newWindowContainerRef } = useNewWindow()

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
        segmentName
      }
    }))
  }, [getFleetSegmentsApiQuery.data])

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

  useEffect(() => {
    const getRiskFactor = async () => {
      try {
        const riskFactor = await dispatch(getVesselRiskFactor(''))

        const faoZones = getFaoZonesFromSpeciesOnboard(riskFactor.speciesOnboard)
        // TODO Remove this `console.log`.
        // eslint-disable-next-line no-console
        console.log('riskfactor', faoZones)
      } catch (err) {
        // TODO Remove this `console.log`.
        // eslint-disable-next-line no-console
        console.log(err)
      }
    }

    getRiskFactor()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  if (!fleetSegmentsAsOptions.length) {
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
            <TagGroup>
              {input.value
                .map(({ faoAreas }) => faoAreas)
                .flat()
                .map(faoArea => (
                  <SingleTag onDelete={noop}>{faoArea}</SingleTag>
                ))}
            </TagGroup>
          </Field>

          <Field>
            <Label>Segment de flotte de la marée</Label>
            <TagGroup>
              {input.value.map(({ segment, segmentName }) => (
                <SingleTag onDelete={noop}>{`${segment} - ${segmentName}`}</SingleTag>
              ))}
            </TagGroup>
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
