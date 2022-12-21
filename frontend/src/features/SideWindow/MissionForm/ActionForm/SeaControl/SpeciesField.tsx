import { FormikCheckbox, FormikMultiRadio, FormikNumberInput, FormikTextarea, Select } from '@mtes-mct/monitor-ui'
import { useField, useFormikContext } from 'formik'
import { append, remove } from 'ramda'
import { Fragment, useCallback } from 'react'
import styled from 'styled-components'

import { FieldGroup } from '../../FieldGroup'
import { FieldsetGroup } from '../../FieldsetGroup'

import type { PartialSeaControl } from '../../types'

export function SpeciesField() {
  const [input, , helper] = useField<PartialSeaControl['specyInfractions']>('specyInfractions')
  const { values } = useFormikContext<PartialSeaControl>()

  const addSpecyInfraction = useCallback(
    (_nextValue: string | undefined) => {
      if (!_nextValue) {
        return
      }

      const nextValue = append({
        specyName: _nextValue
      } as any)(input.value)

      helper.setValue(nextValue)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const removeSpecyInfraction = useCallback(
    (index: number) => {
      const nextValue: any = remove(index, 1)(input.value)

      helper.setValue(nextValue)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  return (
    <FieldsetGroup isLight legend="Espèces à bord">
      {input.value.length > 0 && (
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

          <SpecyInfractionWrapper>
            {input.value.map((specyInfraction, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={`specyInfraction-${index}`}>
                <hr />

                <SpecyInfractionFormWrapper>
                  <Select
                    defaultValue={specyInfraction.specyName}
                    label="Espèce"
                    name={`editedSpecy[${index}].specyName`}
                    onChange={() => removeSpecyInfraction(index)}
                    options={[{ label: specyInfraction.specyName, value: specyInfraction.specyName } as any]}
                  />

                  <FieldGroup isInline>
                    <FormikNumberInput label="Qté déclarée" name={`specyInfractions[${index}].declaredWight`} />
                    <FormikNumberInput label="Qté estimée" name={`specyInfractions[${index}].estinatedWeight`} />
                    <FormikCheckbox label="Sous-taille" name={`specyInfractions[${index}].isUndersized`} />
                  </FieldGroup>
                </SpecyInfractionFormWrapper>
              </Fragment>
            ))}
          </SpecyInfractionWrapper>
        </>
      )}

      {input.value.length > 0 && <hr />}

      <FieldGroup isInline>
        <Select
          key={`newSpecy.specyName-${input.value.length}`}
          disabled={values.hasNoOnboardSpecy}
          label="Ajouter une espèce"
          name="newSpecy.specyName"
          onChange={addSpecyInfraction}
          options={[
            { label: 'Espèce 1', value: 'Espèce 1' },
            { label: 'Espèce 2', value: 'Espèce 2' },
            { label: 'Espèce 3', value: 'Espèce 3' }
          ]}
        />
        <FormikCheckbox disabled={input.value.length > 0} label="Absence d'espèces à bord" name="hasNoOnboardSpecy" />
      </FieldGroup>

      <hr />

      <FormikTextarea label="Observations (hors infraction) sur les espèces" name="speciesNote" />
    </FieldsetGroup>
  )
}

const SpecyInfractionWrapper = styled.div`
  > legend {
    margin: 24px 0 8px;
  }

  > hr {
    margin-bottom: 16px;
  }
`

const SpecyInfractionFormWrapper = styled.div`
  > div {
    margin-top: 12px;
  }
`
