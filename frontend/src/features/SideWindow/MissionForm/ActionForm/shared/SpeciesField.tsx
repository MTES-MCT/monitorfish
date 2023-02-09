import {
  FormikCheckbox,
  FormikMultiRadio,
  FormikNumberInput,
  FormikTextarea,
  Select,
  SingleTag
} from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { append, remove } from 'ramda'
import { Fragment, useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { useGetSpeciesQuery } from '../../../../../api/specy'
import { BOOLEAN_AS_OPTIONS } from '../../../../../constants'
import { MissionAction } from '../../../../../domain/types/missionAction'
import { useNewWindow } from '../../../../../ui/NewWindow'
import { FieldGroup } from '../../FieldGroup'
import { FieldsetGroup } from '../../FieldsetGroup'
import { FieldsetGroupSeparator } from '../../FieldsetGroupSeparator'

import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export function SpeciesField() {
  const {
    setFieldValue,
    values: { speciesInfractions, speciesOnboard }
  } = useFormikContext<MissionActionFormValues>()

  const { newWindowContainerRef } = useNewWindow()

  const getSpeciesApiQuery = useGetSpeciesQuery()

  const speciesAsOptions: Option[] = useMemo(() => {
    if (!getSpeciesApiQuery.data) {
      return []
    }

    return getSpeciesApiQuery.data.species.map(({ code, name }) => ({
      label: `${code} - ${name}`,
      value: code
    }))
  }, [getSpeciesApiQuery.data])

  const addSpecyInfraction = useCallback(
    (nextValue: string | undefined) => {
      if (!nextValue) {
        return
      }

      const nextSpeciesInfractions = append(
        {
          comments: '',
          infractionType: MissionAction.InfractionType.PENDING,
          natinf: 0,
          speciesSeized: false
        },
        speciesInfractions || []
      )
      const nextSpeciesOnboard = append(
        {
          controlledWeight: 0,
          declaredWeight: 0,
          nbFish: 0,
          speciesCode: '',
          underSized: false
        },
        speciesOnboard || []
      )

      setFieldValue('speciesInfractions', nextSpeciesInfractions)
      setFieldValue('speciesOnboard', nextSpeciesOnboard)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [speciesInfractions, speciesOnboard]
  )

  const removeSpecyInfraction = useCallback(
    (index: number) => {
      if (!speciesInfractions || !speciesOnboard) {
        return
      }

      const nextSpeciesInfractions = remove(index, 1, speciesInfractions)
      const nextSpeciesOnboard = remove(index, 1, speciesOnboard)

      setFieldValue('speciesInfractions', nextSpeciesInfractions)
      setFieldValue('speciesOnboard', nextSpeciesOnboard)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [speciesInfractions, speciesOnboard]
  )

  if (!speciesAsOptions.length) {
    return <>Loading...</>
  }

  return (
    <FieldsetGroup isLight legend="Espèces à bord">
      {speciesInfractions && speciesInfractions.length > 0 && (
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

          <SpecyInfractionWrapper>
            {speciesOnboard &&
              speciesOnboard.map((specyOnboard, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Fragment key={`speciesInfraction-${index}`}>
                  <FieldsetGroupSeparator />

                  <SpecyInfractionFormWrapper>
                    <SingleTag
                      onDelete={() => removeSpecyInfraction(index)}
                    >{`${specyOnboard.speciesCode} - ${specyOnboard.speciesCode}`}</SingleTag>

                    <FieldGroup isInline>
                      <FormikNumberInput label="Qté déclarée" name={`speciesInfractions[${index}].declaredWight`} />
                      <FormikNumberInput label="Qté estimée" name={`speciesInfractions[${index}].estinatedWeight`} />
                      <FormikCheckbox label="Sous-taille" name={`speciesInfractions[${index}].isUndersized`} />
                    </FieldGroup>
                  </SpecyInfractionFormWrapper>
                </Fragment>
              ))}
          </SpecyInfractionWrapper>

          <FieldsetGroupSeparator />
        </>
      )}

      <FieldGroup>
        <Select
          key={`newSpecy.specyName-${speciesInfractions ? speciesInfractions.length : 0}`}
          baseContainer={newWindowContainerRef.current}
          label="Ajouter une espèce"
          name="newSpecy.specyName"
          onChange={addSpecyInfraction}
          options={speciesAsOptions}
          searchable
          virtualized
        />
      </FieldGroup>

      <FieldsetGroupSeparator />

      <FormikTextarea label="Observations (hors infraction) sur les espèces" name="speciesObservations" />
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
