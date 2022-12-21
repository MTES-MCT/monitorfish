import { FormikMultiRadio, FormikMultiSelect, Select } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { append } from 'ramda'
import { useCallback, useMemo } from 'react'

import { FieldsetGroup } from '../../FieldsetGroup'

import type { PartialSeaControl } from '../../types'

export function FleetSegmentsField() {
  const [tideFishingZonesInput, , tideFishingZonesHelper] =
    useField<PartialSeaControl['tideFishingZones']>('tideFishingZones')
  const [tideFleetSegmentsInput, , tideFleetSegmentsHelper] =
    useField<PartialSeaControl['tideFleetSegments']>('tideFleetSegments')

  const isEmpty = useMemo(
    () => tideFishingZonesInput.value.length + tideFleetSegmentsInput.value.length === 0,
    [tideFishingZonesInput.value, tideFleetSegmentsInput.value]
  )

  const addFleetSegment = useCallback(
    (_nextValue: string | undefined) => {
      if (!_nextValue) {
        return
      }

      const nextTideFishingZonesValue = append('37.1' as any)(tideFishingZonesInput.value)
      const nextTideFleetSegmentsValue = append(_nextValue as any)(tideFleetSegmentsInput.value)

      tideFishingZonesHelper.setValue(nextTideFishingZonesValue)
      tideFleetSegmentsHelper.setValue(nextTideFleetSegmentsValue)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tideFishingZonesInput.value, tideFleetSegmentsInput.value]
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
          <em>
            Renseignez un point de contrôle, les engins utilisés et les espèce pêchées pour qu’un segment de flotte soit
            attribué au navire.
          </em>
        </p>
      )}

      <Select
        key={`newFleetSegment.name-${tideFleetSegmentsInput.value.length}`}
        label="Ajouter un segment"
        name="newFleetSegment.name"
        onChange={addFleetSegment}
        options={[
          { label: 'Segment de flotte 1', value: 'Segment de flotte 1' },
          { label: 'Segment de flotte 2', value: 'Segment de flotte 2' },
          { label: 'Segment de flotte 3', value: 'Segment de flotte 3' }
        ]}
      />
    </FieldsetGroup>
  )
}
