import { FormikCheckbox, FormikMultiRadio, FormikNumberInput, Select, SingleTag } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useField } from 'formik'
import { append, remove as ramdaRemove } from 'ramda'
import { useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { FormikMultiInfractionPicker } from './FormikMultiInfractionPicker'
import { useGetSpeciesQuery } from '../../../../../api/specy'
import { useGetRiskFactorQuery } from '../../../../../api/vessel'
import { BOOLEAN_AS_OPTIONS } from '../../../../../constants'
import { MissionAction } from '../../../../../domain/types/missionAction'
import { FrontendError } from '../../../../../libs/FrontendError'
import { useNewWindow } from '../../../../../ui/NewWindow'
import { FieldGroup } from '../../shared/FieldGroup'
import { FieldsetGroupSpinner } from '../../shared/FieldsetGroup'
import { FieldsetGroupSeparator } from '../../shared/FieldsetGroupSeparator'

import type { Specy } from '../../../../../domain/types/specy'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

const TypedFormikMultiInfractionPicker = FormikMultiInfractionPicker<MissionAction.SpeciesInfraction>

export type SpeciesFieldProps = {
  controlledWeightLabel: string
}
export function SpeciesField({ controlledWeightLabel }: SpeciesFieldProps) {
  const [input, , helper] = useField<MissionActionFormValues['speciesOnboard']>('speciesOnboard')
  const { newWindowContainerRef } = useNewWindow()

  // Other field controlling this field
  const [{ value: internalReferenceNumber }] =
    useField<MissionActionFormValues['internalReferenceNumber']>('internalReferenceNumber')
  const riskFactorApiQuery = useGetRiskFactorQuery(internalReferenceNumber || skipToken)

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

  const getSpecyNameFromSpecyCode = useCallback(
    (specyCode: Specy['code']) => {
      if (!getSpeciesApiQuery.data) {
        return ''
      }

      const foundSpecy = getSpeciesApiQuery.data.species.find(({ code }) => code === specyCode)
      if (!foundSpecy) {
        return ''
      }

      return foundSpecy.name
    },
    [getSpeciesApiQuery.data]
  )

  const remove = useCallback(
    (index: number) => {
      if (!input.value) {
        throw new FrontendError('`input.value` is undefined')
      }

      const nextSpeciesOnboard = ramdaRemove(index, 1, input.value)

      helper.setValue(nextSpeciesOnboard)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  useEffect(
    () => {
      if (input.value?.length || !riskFactorApiQuery.data) {
        return
      }

      const speciesOnBoard = riskFactorApiQuery.data.speciesOnboard
      if (!speciesOnBoard) {
        return
      }

      const speciesOnboardToAdd = speciesOnBoard.map(specy => ({
        controlledWeight: undefined,
        declaredWeight: specy.weight,
        nbFish: undefined,
        speciesCode: specy.species,
        underSized: false
      }))

      const nextSpeciesOnboard = (input.value || []).concat(speciesOnboardToAdd)
      helper.setValue(nextSpeciesOnboard)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [riskFactorApiQuery.data]
  )

  if (!speciesAsOptions.length) {
    return <FieldsetGroupSpinner isLight legend="Espèces à bord" />
  }

  return (
    <TypedFormikMultiInfractionPicker
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
      seizurePropName="speciesSeized"
      seizureTagLabel="Appréhension espèce"
    >
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
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />

      {input.value && input.value.length > 0 && (
        <>
          {input.value.map((specyOnboard, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Row key={`speciesOnboard-${index}`}>
              <FieldsetGroupSeparator />

              <RowInnerWrapper>
                <SingleTag onDelete={() => remove(index)}>{`${specyOnboard.speciesCode} - ${getSpecyNameFromSpecyCode(
                  specyOnboard.speciesCode
                )}`}</SingleTag>

                <FieldGroup isInline>
                  <FormikNumberInput label="Qté déclarée" name={`speciesOnboard[${index}].declaredWeight`} />
                  <FormikNumberInput label={controlledWeightLabel} name={`speciesOnboard[${index}].controlledWeight`} />
                  <FormikCheckbox label="Sous-taille" name={`speciesOnboard[${index}].underSized`} />
                </FieldGroup>
              </RowInnerWrapper>
            </Row>
          ))}
        </>
      )}

      <Select
        key={String(input.value?.length)}
        baseContainer={newWindowContainerRef.current}
        label="Ajouter une espèce"
        name="newSpecy"
        onChange={add}
        options={speciesAsOptions}
        searchable
        virtualized
      />
    </TypedFormikMultiInfractionPicker>
  )
}

const Row = styled.div`
  > legend {
    margin: 24px 0 8px;
  }

  > hr {
    margin-bottom: 16px;
  }

  input[type='number'] {
    width: 112px;
  }
`

const RowInnerWrapper = styled.div`
  > div {
    margin-top: 12px;
  }
`
