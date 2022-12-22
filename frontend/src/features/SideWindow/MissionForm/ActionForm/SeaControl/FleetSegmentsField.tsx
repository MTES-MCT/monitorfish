import { FormikMultiRadio, FormikMultiSelect, Select } from '@mtes-mct/monitor-ui'
import { useField, useFormikContext } from 'formik'
import { append } from 'ramda'
import { useCallback, useEffect, useMemo } from 'react'

import { getFaoZonesFromSpeciesOnboard } from '../../../../../domain/entities/vessel/riskFactor'
import { getVesselRiskFactor } from '../../../../../domain/use_cases/vessel/getVesselRiskFactor'
import { useAppDispatch } from '../../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../../hooks/useAppSelector'
import { FieldsetGroup } from '../../FieldsetGroup'

import type { PartialSeaControl } from '../../types'

export function FleetSegmentsField() {
  const dispatch = useAppDispatch()
  const fleetSegments = useAppSelector(state => state.fleetSegment.fleetSegments)
  const {
    values: {
      vessel: { internalReferenceNumber }
    }
  } = useFormikContext<PartialSeaControl>()

  const [tideFishingZonesInput, , tideFishingZonesHelper] =
    useField<PartialSeaControl['tideFishingZones']>('tideFishingZones')
  const [tideFleetSegmentsInput, , tideFleetSegmentsHelper] =
    useField<PartialSeaControl['tideFleetSegments']>('tideFleetSegments')

  const isEmpty = useMemo(
    () => tideFishingZonesInput.value.length + tideFleetSegmentsInput.value.length === 0,
    [tideFishingZonesInput.value, tideFleetSegmentsInput.value]
  )

  useEffect(() => {
    const getRiskFactor = async () => {
      try {
        const riskFactor = await dispatch(getVesselRiskFactor(internalReferenceNumber))

        tideFleetSegmentsHelper.setValue(riskFactor.segments)
        const faoZones = getFaoZonesFromSpeciesOnboard(riskFactor.speciesOnboard)
        tideFishingZonesHelper.setValue(faoZones)
      } catch (e) {
        tideFleetSegmentsHelper.setValue([])
        tideFishingZonesHelper.setValue([])
      }
    }

    getRiskFactor()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, internalReferenceNumber])

  const addFleetSegment = useCallback(
    (_nextSegment: string | undefined) => {
      if (!_nextSegment) {
        return
      }

      const faoZones = fleetSegments.find(fleetSegment => fleetSegment.segment === _nextSegment)?.faoAreas || []
      const nextTideFishingZonesValue = tideFishingZonesInput.value.concat(faoZones)
      const nextTideFleetSegmentsValue = append(_nextSegment as any)(tideFleetSegmentsInput.value)

      tideFishingZonesHelper.setValue(nextTideFishingZonesValue)
      tideFleetSegmentsHelper.setValue(nextTideFleetSegmentsValue)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tideFishingZonesInput.value, tideFleetSegmentsInput.value]
  )

  const labelledFleetSegments = useMemo(
    () =>
      fleetSegments.map(fleetSegment => ({
        label: `${fleetSegment.segmentName} (${fleetSegment.segment})`,
        value: fleetSegment.segment
      })),
    [fleetSegments]
  )

  return (
    <FieldsetGroup isLight legend="Segment de flotte">
      {!isEmpty && (
        <>
          {/* TODO Add a BooleanRadio field in monitor-ui. */}
          <FormikMultiRadio
            isInline
            label="Poids des espèces vérifiés"
            name="isSpeciesWeightChecked"
            options={
              [
                { label: 'Oui', value: true },
                { label: 'Non', value: false }
              ] as any
            }
          />
          <FormikMultiRadio
            isInline
            label="Taille des espèces vérifiées"
            name="isSpeciesSizeChecked"
            options={
              [
                { label: 'Oui', value: true },
                { label: 'Non', value: false }
              ] as any
            }
          />
          <FormikMultiRadio
            isInline
            label="Arrimage séparé des espèces soumises à plan"
            name="hasSeparateStowageForSpeciesUnderMultiYearProgram"
            options={
              [
                { label: 'Oui', value: true },
                { label: 'Non', value: false }
              ] as any
            }
          />
        </>
      )}

      {tideFishingZonesInput.value.length > 0 && (
        <FormikMultiSelect
          fixedWidth={460}
          label="Zones de pêche de la marée (issues des FAR)"
          name="tideFishingZones"
          options={tideFishingZonesInput.value.map(value => ({ label: value, value }))}
        />
      )}

      {tideFleetSegmentsInput.value.length > 0 && (
        <FormikMultiSelect
          fixedWidth={460}
          label="Segment de flotte de la marée"
          name="tideFleetSegments"
          options={tideFleetSegmentsInput.value.map(value => ({ label: value, value }))}
        />
      )}

      {!isEmpty && <hr />}
      {isEmpty && (
        <p>
          <em>Le segment de flotte sera attribué automatiquement lors de l’ajout d’un navire.</em>
        </p>
      )}

      <Select
        key={`newFleetSegment.name-${tideFleetSegmentsInput.value.length}`}
        label="Ajouter un segment"
        name="newFleetSegment.name"
        onChange={addFleetSegment}
        options={labelledFleetSegments}
      />
    </FieldsetGroup>
  )
}
