import { useGetFaoAreasQuery } from '@api/faoAreas'
import { useGetSpeciesQuery } from '@api/specy'
import { LogbookSpeciesPresentation } from '@features/Logbook/constants'
import { MissionAction } from '@features/Mission/missionAction.types'
import { useGetVesselQuery } from '@features/Vessel/vesselApi'
import { FrontendError } from '@libs/FrontendError'
import {
  Accent,
  Button,
  CustomSearch,
  FormikCheckbox,
  FormikCheckPicker,
  FormikNumberInput,
  FormikTextarea,
  Icon,
  IconButton,
  Select,
  SingleTag,
  usePrevious
} from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useField, useFormikContext } from 'formik'
import { isEqual } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { getDefaultPresentationCodes } from '../utils'
import { ControlCheckTable } from './ControlCheckTable'
import { useGetMissionActionFormikUsecases } from '../../hooks/useGetMissionActionFormikUsecases'
import { useIsEISREnabled } from '../../hooks/useIsEISREnabled'
import { FieldsetGroup, FieldsetGroupSpinner } from '../../shared/FieldsetGroup'
import { FieldsetGroupSeparator } from '../../shared/FieldsetGroupSeparator'

import type { ControlCheckRow } from './ControlCheckTable'
import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'
import type { Specy } from 'domain/types/specy'

const PRESENTATION_OPTIONS: Array<Option<string>> = Object.entries(LogbookSpeciesPresentation).map(([code, label]) => ({
  label: `${code} - ${label}`,
  value: code
}))

type VisibilityState = { underSized: boolean }

type SpeciesFieldProps = Readonly<{
  controlledWeightLabel: string
}>
export function SpeciesField({ controlledWeightLabel }: SpeciesFieldProps) {
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()
  const [input, , helper] = useField<MissionActionFormValues['speciesOnboard']>('speciesOnboard')
  const previousValue = usePrevious(input.value)
  const { updateSegments } = useGetMissionActionFormikUsecases()
  const isEISREnabled = useIsEISREnabled(values.actionDatetimeUtc)
  const { data: vessel } = useGetVesselQuery(values.vesselId ?? skipToken)

  const isLandControl = values.actionType === MissionAction.MissionActionType.LAND_CONTROL
  const legend = isLandControl ? 'Inspection des captures' : 'Espèces à bord'

  const getSpeciesApiQuery = useGetSpeciesQuery()
  const getFaoAreasQuery = useGetFaoAreasQuery()

  const [visibilityByIndex, setVisibilityByIndex] = useState<VisibilityState[]>(() =>
    (input.value ?? []).map(s => ({
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

    const newSpecies: MissionAction.SpeciesOnboardControl = {
      controlledWeight: undefined,
      declaredWeight: undefined,
      faoZones: isEISREnabled ? values.faoAreas : undefined,
      nbFish: undefined,
      presentationCodes: getDefaultPresentationCodes(isEISREnabled, vessel?.length),
      speciesCode: newSpecy.code,
      speciesName: newSpecy.name,
      underSized: false,
      underSizedWeight: undefined
    }
    const nextSpeciesOnboard = [...(input.value ?? []), newSpecies]

    setVisibilityByIndex(prev => [...prev, { underSized: false }])
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

    const nextSpeciesOnboard = input.value.filter((_, currentIndex) => currentIndex !== index)

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
      next[index] = { ...(next[index] ?? { underSized: false }), underSized: true }

      return next
    })
  }

  const closeUnderSized = (index: number) => {
    setVisibilityByIndex(prev => {
      const next = [...prev]
      next[index] = { ...(next[index] ?? { underSized: false }), underSized: false }

      return next
    })
    setFieldValue(`speciesOnboard[${index}].underSizedWeight`, undefined)
  }

  const isUnderSizedShown = (index: number): boolean => {
    const species = input.value?.[index]
    if (species?.underSizedWeight !== undefined && species?.underSizedWeight !== null) {
      return true
    }

    return visibilityByIndex[index]?.underSized ?? false
  }

  if (!speciesAsOptions.length || !customSearch) {
    return <FieldsetGroupSpinner isLight legend={legend} />
  }

  const baseSpeciesCheckRows: ControlCheckRow[] = [
    { isRequired: true, label: 'Poids des espèces vérifiés', name: 'speciesWeightControlled' },
    { isRequired: true, label: 'Taille des espèces vérifiées', name: 'speciesSizeControlled' },
    {
      isRequired: true,
      label: 'Arrimage séparé des espèces soumises à plan',
      name: 'separateStowageOfPreservedSpecies'
    }
  ]

  let controlCheckRows: ControlCheckRow[]
  if (isLandControl) {
    controlCheckRows = isEISREnabled
      ? [
          {
            isSectionHeader: true,
            label: (
              <>
                Pour les captures <u>débarquées</u>
              </>
            ),
            name: 'unloadedSection'
          },
          {
            isRequired: true,
            label: 'Taille minimale de référence de conservation contrôlée',
            name: 'minimumConservationReferenceSizeControlled'
          },
          {
            isRequired: true,
            label: 'Contrôle de pesée / décompte des caisses / échantillonnage',
            name: 'cratesWeighingSamplingControl'
          },
          {
            isRequired: true,
            label: "Informations sur l'opérateur de pesée agréé",
            name: 'approvedWeighingOperatorInformation'
          },
          { isRequired: true, label: 'Cale contrôlée après déchargement', name: 'holdControlledAfterUnloading' },
          { isRequired: true, label: 'Pesée des captures lors du débarquement', name: 'catchesWeighedAtLanding' },
          {
            isSectionHeader: true,
            label: (
              <>
                Pour les captures <u>non débarquées</u>
              </>
            ),
            name: 'heldOnboardSection'
          },
          {
            isRequired: true,
            label: "Enregistrement séparé des poissons n'ayant pas la taille requise",
            name: 'underSizedSeparateRecording'
          }
        ]
      : baseSpeciesCheckRows
  } else {
    controlCheckRows = [
      ...baseSpeciesCheckRows,
      ...(isEISREnabled
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
  }

  return (
    <FieldsetGroup isLight legend={legend}>
      <ControlCheckTable rows={controlCheckRows} />

      {input.value && input.value.length > 0 && (
        <>
          <FieldsetGroupSeparator marginBottom={12} />
          {input.value.map((specyOnboard, index) => (
            <Row
              // eslint-disable-next-line react/no-array-index-key
              key={`speciesOnboard-${specyOnboard.speciesCode}-${index}`}
              $isLast={index + 1 === input.value?.length}
            >
              <TagRow>
                <StyledSingleTag onDelete={() => remove(index)}>{`${
                  specyOnboard.speciesCode
                } - ${getSpecyNameFromSpecyCode(specyOnboard.speciesCode)}`}</StyledSingleTag>
                {isEISREnabled && !isUnderSizedShown(index) && (
                  <AddButton
                    accent={Accent.SECONDARY}
                    disabled={!values.isGangwayDeployed}
                    Icon={Icon.Plus}
                    onClick={() => openUnderSized(index)}
                  >
                    Sous-taille
                  </AddButton>
                )}
                {isLandControl && isEISREnabled && (
                  <FormikCheckbox label="Espèce non débarquée" name={`speciesOnboard[${index}].isNotLanded`} />
                )}
              </TagRow>

              <FieldsRow>
                <FormikNumberInput
                  disabled={!values.isGangwayDeployed}
                  label="Qté déclarée"
                  name={`speciesOnboard[${index}].declaredWeight`}
                />
                <FormikNumberInput
                  disabled={!values.isGangwayDeployed}
                  label={controlledWeightLabel}
                  name={`speciesOnboard[${index}].controlledWeight`}
                />
                {isEISREnabled ? (
                  <>
                    {isUnderSizedShown(index) && (
                      <>
                        <FormikNumberInput
                          disabled={!values.isGangwayDeployed}
                          label="Qté ss-taille"
                          name={`speciesOnboard[${index}].underSizedWeight`}
                        />
                        <DeleteButton
                          accent={Accent.SECONDARY}
                          Icon={Icon.Delete}
                          onClick={() => closeUnderSized(index)}
                          title="Retirer la sous-taille"
                        />
                      </>
                    )}
                    <StyledCheckPicker
                      disabled={!values.isGangwayDeployed}
                      label="Présentation"
                      name={`speciesOnboard[${index}].presentationCodes`}
                      options={PRESENTATION_OPTIONS}
                      searchable
                    />
                    <StyledCheckPicker
                      disabled={!values.isGangwayDeployed}
                      isRequired
                      label="Zone de pêche"
                      name={`speciesOnboard[${index}].faoZones`}
                      options={faoAreasAsOptions}
                      searchable
                    />
                  </>
                ) : (
                  <FormikCheckbox label="Sous-taille" name={`speciesOnboard[${index}].underSized`} />
                )}
              </FieldsRow>
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

const StyledCheckPicker = styled(FormikCheckPicker)`
  flex: 1;
  min-width: 150px;
  max-width: 250px;

  .rs-picker-value-count {
    margin-top: 2px !important;
    min-width: 16px !important;
    min-height: 16px !important;
    height: 16px !important;
    background-color: ${p => p.theme.color.white} !important;
    color: ${p => p.theme.color.gunMetal};
  }
`

const StyledSingleTag = styled(SingleTag)`
  max-width: 280px;
`

const TagRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`

const Row = styled.div<{
  $isLast: boolean
}>`
  margin-bottom: ${p => (p.$isLast ? 0 : 40)}px;

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

const FieldsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 8px;
  margin-top: 8px;
  width: 100%;

  > .Field-NumberInput {
    input {
      height: 30px;
      width: 85px;
    }
  }
`

const AddButton = styled(Button)`
  align-self: flex-end;
  height: 30px;
`

const DeleteButton = styled(IconButton)`
  align-self: flex-end;
  margin-left: -6px;
  width: 30px;
  height: 30px;
`
