import { useGetFaoAreasQuery } from '@api/faoAreas'
import { useGetSpeciesQuery } from '@api/specy'
import { LogbookSpeciesPresentation } from '@features/Logbook/constants'
import { DISCARD_REASON_LABEL } from '@features/Mission/constants'
import { FrontendError } from '@libs/FrontendError'
import {
  Accent,
  Button,
  CustomSearch,
  FormikCheckbox,
  FormikMultiSelect,
  FormikNumberInput,
  FormikSelect,
  FormikTextarea,
  Icon,
  Select,
  SingleTag,
  Size,
  usePrevious
} from '@mtes-mct/monitor-ui'
import { useField, useFormikContext } from 'formik'
import { isEqual } from 'lodash-es'
import { append, remove as ramdaRemove } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ControlCheckTable } from './ControlCheckTable'
import { E_ISR_ENABLED } from '../../constants'
import { useGetMissionActionFormikUsecases } from '../../hooks/useGetMissionActionFormikUsecases'
import { FieldsetGroup, FieldsetGroupSpinner } from '../../shared/FieldsetGroup'
import { FieldsetGroupSeparator } from '../../shared/FieldsetGroupSeparator'

import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'
import type { Specy } from 'domain/types/specy'

type SpeciesFieldProps = Readonly<{
  controlledWeightLabel: string
}>

const DISCARD_REASON_OPTIONS: Array<Option<string>> = Object.entries(DISCARD_REASON_LABEL).map(([code, label]) => ({
  label: `${code} - ${label}`,
  value: code
}))

const PRESENTATION_OPTIONS: Array<Option<string>> = Object.entries(LogbookSpeciesPresentation).map(([code, label]) => ({
  label: `${code} - ${label}`,
  value: code
}))

type VisibilityState = { rejected: boolean; underSized: boolean }

export function SpeciesField({ controlledWeightLabel }: SpeciesFieldProps) {
  const { values } = useFormikContext<MissionActionFormValues>()
  const [input, , helper] = useField<MissionActionFormValues['speciesOnboard']>('speciesOnboard')
  const previousValue = usePrevious(input.value)
  const { updateSegments } = useGetMissionActionFormikUsecases()

  const getSpeciesApiQuery = useGetSpeciesQuery()
  const getFaoAreasQuery = useGetFaoAreasQuery()

  const [visibilityByIndex, setVisibilityByIndex] = useState<VisibilityState[]>(() =>
    (input.value ?? []).map(s => ({
      rejected: s.rejectedWeight !== undefined && s.rejectedWeight !== null,
      underSized: s.underSizedWeight !== undefined && s.underSizedWeight !== null
    }))
  )

  /**
   * This is only used to re-compute fleet segments when a species is modified
   *  (`input.value.length === previousValue.length`).
   * This should NOT re-compute when:
   * - A species is added
   * - A species is removed
   * As these actions are handled below by functions `add()` and `remove()`.
   * */
  useEffect(() => {
    if (
      !!input.value &&
      !!previousValue &&
      input.value.length === previousValue.length &&
      !isEqual(input.value, previousValue)
    ) {
      updateSegments({
        ...values,
        speciesOnboard: input.value
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.value, previousValue])

  const speciesAsOptions: Array<Option<Specy>> = useMemo(
    () =>
      getSpeciesApiQuery.data
        ? getSpeciesApiQuery.data.species.map(specy => ({
            label: `${specy.code} - ${specy.name}`,
            value: specy
          }))
        : [],
    [getSpeciesApiQuery.data]
  )

  const faoAreasAsOptions: Array<Option<string>> = useMemo(
    () => (getFaoAreasQuery.data ? getFaoAreasQuery.data.map(zone => ({ label: zone, value: zone })) : []),
    [getFaoAreasQuery.data]
  )

  const customSearch = useMemo(
    () =>
      getSpeciesApiQuery.data
        ? new CustomSearch(
            structuredClone(speciesAsOptions),
            [
              {
                name: 'value.code',
                weight: 0.9
              },
              {
                name: 'value.name',
                weight: 0.1
              }
            ],
            { cacheKey: 'SPECIES_AS_OPTIONS', isStrict: true }
          )
        : undefined,
    [getSpeciesApiQuery.data, speciesAsOptions]
  )

  const add = (newSpecy: Specy | undefined) => {
    if (!newSpecy) {
      // TODO Add a form validation to avoid `undefined`.

      return
    }

    const nextSpeciesOnboard = append(
      {
        controlledWeight: undefined,
        declaredWeight: undefined,
        discardReason: undefined,
        faoZones: undefined,
        nbFish: undefined,
        presentationCode: undefined,
        rejectedWeight: undefined,
        speciesCode: newSpecy.code,
        underSized: false,
        underSizedWeight: undefined
      },
      input.value ?? []
    )

    setVisibilityByIndex(prev => [...prev, { rejected: false, underSized: false }])
    updateSegments({
      ...values,
      speciesOnboard: nextSpeciesOnboard
    })
    helper.setValue(nextSpeciesOnboard)
  }

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

  const remove = (index: number) => {
    if (!input.value) {
      throw new FrontendError('`input.value` is undefined')
    }

    const nextSpeciesOnboard = ramdaRemove(index, 1, input.value)

    setVisibilityByIndex(prev => {
      const next = [...prev]
      next.splice(index, 1)

      return next
    })
    updateSegments({
      ...values,
      speciesOnboard: nextSpeciesOnboard
    })
    helper.setValue(nextSpeciesOnboard)
  }

  const openUnderSized = (index: number) => {
    setVisibilityByIndex(prev => {
      const next = [...prev]
      next[index] = { ...(next[index] ?? { rejected: false, underSized: false }), underSized: true }

      return next
    })
  }

  const openRejected = (index: number) => {
    setVisibilityByIndex(prev => {
      const next = [...prev]
      next[index] = { ...(next[index] ?? { rejected: false, underSized: false }), rejected: true }

      return next
    })
  }

  const isUnderSizedShown = (index: number): boolean => {
    const species = input.value?.[index]
    if (species?.underSizedWeight !== undefined && species?.underSizedWeight !== null) {
      return true
    }

    return visibilityByIndex[index]?.underSized ?? false
  }

  const isRejectedShown = (index: number): boolean => {
    const species = input.value?.[index]
    if (species?.rejectedWeight !== undefined && species?.rejectedWeight !== null) {
      return true
    }

    return visibilityByIndex[index]?.rejected ?? false
  }

  if (!speciesAsOptions.length || !customSearch) {
    return <FieldsetGroupSpinner isLight legend="Espèces à bord" />
  }

  const controlCheckRows = [
    { isRequired: true, label: 'Poids des espèces vérifiés', name: 'speciesWeightControlled' },
    { isRequired: true, label: 'Taille des espèces vérifiées', name: 'speciesSizeControlled' },
    {
      isRequired: true,
      label: 'Arrimage séparé des espèces soumises à plan',
      name: 'separateStowageOfPreservedSpecies'
    },
    ...(E_ISR_ENABLED
      ? [
          {
            isRequired: true,
            label: "Arrimage séparé des poissons n'ayant pas la taille requise",
            name: 'underSizedSeparateStowage'
          },
          {
            isRequired: true,
            label: "Enregistrement séparé des poissons n'ayant pas la taille requise",
            name: 'underSizedSeparateRecording'
          }
        ]
      : [])
  ]

  return (
    <FieldsetGroup isLight legend="Espèces à bord">
      <ControlCheckTable rows={controlCheckRows} />

      {input.value && input.value.length > 0 && (
        <>
          <FieldsetGroupSeparator marginBottom={12} />
          {input.value.map((specyOnboard, index) => (
            <Row
              // eslint-disable-next-line react/no-array-index-key
              key={`speciesOnboard-${specyOnboard.speciesCode}-${index}`}
              style={{ marginTop: index === 0 ? '16px' : 0 }}
            >
              <StyledSingleTag onDelete={() => remove(index)}>{`${
                specyOnboard.speciesCode
              } - ${getSpecyNameFromSpecyCode(specyOnboard.speciesCode)}`}</StyledSingleTag>

              <WeightsRow>
                <FormikNumberInput isRequired label="Qté déclarée" name={`speciesOnboard[${index}].declaredWeight`} />
                <FormikNumberInput
                  isRequired
                  label={controlledWeightLabel}
                  name={`speciesOnboard[${index}].controlledWeight`}
                />
                {E_ISR_ENABLED ? (
                  <>
                    {isUnderSizedShown(index) ? (
                      <FormikNumberInput label="Qté sous-taille" name={`speciesOnboard[${index}].underSizedWeight`} />
                    ) : (
                      <AddButton
                        accent={Accent.SECONDARY}
                        Icon={Icon.Plus}
                        onClick={() => openUnderSized(index)}
                        size={Size.SMALL}
                      >
                        Ajouter sous-taille
                      </AddButton>
                    )}
                    {isRejectedShown(index) ? (
                      <>
                        <FormikNumberInput label="Qté rejetée" name={`speciesOnboard[${index}].rejectedWeight`} />
                        <FormikSelect
                          label="Nature du rejet"
                          name={`speciesOnboard[${index}].discardReason`}
                          options={DISCARD_REASON_OPTIONS}
                        />
                      </>
                    ) : (
                      <AddButton
                        accent={Accent.SECONDARY}
                        Icon={Icon.Plus}
                        onClick={() => openRejected(index)}
                        size={Size.SMALL}
                      >
                        Ajouter rejet
                      </AddButton>
                    )}
                  </>
                ) : (
                  <FormikCheckbox label="Sous-taille" name={`speciesOnboard[${index}].underSized`} />
                )}
              </WeightsRow>

              {E_ISR_ENABLED && (
                <PresentationFaoRow>
                  <FormikSelect
                    isRequired
                    label="Présentation du poisson"
                    name={`speciesOnboard[${index}].presentationCode`}
                    options={PRESENTATION_OPTIONS}
                    searchable
                  />
                  <StyledFaoZones
                    isRequired
                    label="Zone de pêche"
                    name={`speciesOnboard[${index}].faoZones`}
                    options={faoAreasAsOptions}
                    searchable
                  />
                </PresentationFaoRow>
              )}
            </Row>
          ))}
        </>
      )}
      <FieldsetGroupSeparator marginBottom={14} />

      <Select
        key={String(input.value?.length)}
        customSearch={customSearch}
        label="Ajouter une espèce"
        name="newSpecy"
        onChange={add}
        options={speciesAsOptions}
        optionValueKey="code"
        searchable
        virtualized
      />
      <FieldsetGroupSeparator marginBottom={12} />
      <FormikTextarea label="Observations (hors infraction) sur les espèces" name="speciesObservations" rows={2} />
    </FieldsetGroup>
  )
}

const StyledFaoZones = styled(FormikMultiSelect)`
  width: 250px;
`

const StyledSingleTag = styled(SingleTag)`
  width: 280px;
  margin-top: 8px;
`

const Row = styled.div`
  margin-bottom: 16px;

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

const WeightsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 8px;
  margin-top: 8px;

  > .Field-NumberInput {
    input {
      height: 30px;
    }
  }
`

const PresentationFaoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`

const AddButton = styled(Button)`
  align-self: flex-end;
  margin-bottom: 4px;
`
