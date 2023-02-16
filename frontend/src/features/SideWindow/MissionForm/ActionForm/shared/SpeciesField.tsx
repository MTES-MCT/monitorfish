import { FormikCheckbox, FormikMultiRadio, FormikNumberInput, Select, SingleTag } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { append, remove as ramdaRemove } from 'ramda'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { FormikMultiInfractionPicker } from './FormikMultiInfractionPicker'
import { useGetSpeciesQuery } from '../../../../../api/specy'
import { BOOLEAN_AS_OPTIONS } from '../../../../../constants'
import { FrontendError } from '../../../../../libs/FrontendError'
import { useNewWindow } from '../../../../../ui/NewWindow'
import { FieldGroup } from '../../FieldGroup'
import { FieldsetGroupSeparator } from '../../FieldsetGroupSeparator'

import type { Specy } from '../../../../../domain/types/specy'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export function SpeciesField() {
  const [input, , helper] = useField<MissionActionFormValues['speciesOnboard']>('speciesOnboard')

  const { newWindowContainerRef } = useNewWindow()

  const getSpeciesApiQuery = useGetSpeciesQuery()

  const speciesAsOptions: Array<Option<Specy>> = useMemo(() => {
    if (!getSpeciesApiQuery.data) {
      return []
    }

    return getSpeciesApiQuery.data.species.map(specy => ({
      label: `${specy.code} - ${specy.name}`,
      value: specy
    }))
  }, [getSpeciesApiQuery.data])

  const add = useCallback(
    (newSpecy: Specy | undefined) => {
      if (!newSpecy) {
        // TODO Add a form validation to avoid `undefined`.

        return
      }

      const nextSpeciesOnboard = append(
        {
          controlledWeight: undefined,
          declaredWeight: undefined,
          nbFish: undefined,
          speciesCode: newSpecy.code,
          underSized: false
        },
        input.value || []
      )

      helper.setValue(nextSpeciesOnboard)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const remove = useCallback(
    (index: number) => {
      if (!input.value) {
        throw new FrontendError('`input.value` is undefined. This should never happen.', 'remove()')
      }

      const nextSpeciesOnboard = ramdaRemove(index, 1, input.value)

      helper.setValue(nextSpeciesOnboard)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  if (!speciesAsOptions.length) {
    return <>Loading...</>
  }

  return (
    <FormikMultiInfractionPicker
      addButtonLabel="Ajouter une infraction espèces"
      generalObservationTextareaProps={{
        label: 'Observations (hors infraction) sur les espèces',
        name: 'speciesObservations'
      }}
      // TODO Check that prop (it's a radio in the XD which doesn't make sense to me).
      infractionCheckboxProps={{
        label: 'Appréhension espèces',
        name: 'speciesSeized'
      }}
      label="Espèces à bord"
      name="speciesInfractions"
    >
      {input.value && input.value.length > 0 && (
        <>
          {/* TODO Add a BooleanRadio field in monitor-ui. */}
          <FormikMultiRadio
            isInline
            label="Poids des espèces vérifiés"
            name="speciesWeightControlled"
            options={BOOLEAN_AS_OPTIONS}
          />
          <FormikMultiRadio
            isInline
            label="Taille des espèces vérifiées"
            name="speciesSizeControlled"
            options={BOOLEAN_AS_OPTIONS}
          />
          <FormikMultiRadio
            isInline
            label="Arrimage séparé des espèces soumises à plan"
            name="separateStowageOfPreservedSpecies"
            options={BOOLEAN_AS_OPTIONS}
          />

          {input.value.map((specyOnboard, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Row key={`speciesOnboard-${index}`}>
              <FieldsetGroupSeparator />

              <RowInnerWrapper>
                <SingleTag
                  onDelete={() => remove(index)}
                >{`${specyOnboard.speciesCode} - ${specyOnboard.speciesCode}`}</SingleTag>

                <FieldGroup isInline>
                  <FormikNumberInput label="Qté déclarée" name={`speciesOnboard[${index}].declaredWeight`} />
                  <FormikNumberInput label="Qté estimée" name={`speciesOnboard[${index}].controlledWeight`} />
                  <FormikCheckbox label="Sous-taille" name={`speciesOnboard[${index}].underSized`} />
                </FieldGroup>
              </RowInnerWrapper>
            </Row>
          ))}
        </>
      )}

      <FieldGroup>
        <Select
          key={String(input.value?.length)}
          baseContainer={newWindowContainerRef.current}
          label="Ajouter une espèce"
          name="newSpecy.specyName"
          onChange={add}
          options={speciesAsOptions}
          searchable
          virtualized
        />
      </FieldGroup>
    </FormikMultiInfractionPicker>
  )
}

const Row = styled.div`
  > legend {
    margin: 24px 0 8px;
  }

  > hr {
    margin-bottom: 16px;
  }
`

const RowInnerWrapper = styled.div`
  > div {
    margin-top: 12px;
  }
`
