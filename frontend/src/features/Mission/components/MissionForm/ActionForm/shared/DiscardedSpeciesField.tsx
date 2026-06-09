import { useGetFaoAreasQuery } from '@api/faoAreas'
import { useGetSpeciesQuery } from '@api/specy'
import { DISCARD_REASON_LABEL } from '@features/Mission/constants'
import { MissionAction } from '@features/Mission/missionAction.types'
import { FrontendError } from '@libs/FrontendError'
import {
  Accent,
  Button,
  CustomSearch,
  FormikCheckPicker,
  FormikNumberInput,
  FormikSelect,
  Icon,
  IconButton,
  Select,
  SingleTag
} from '@mtes-mct/monitor-ui'
import { useField, useFormikContext } from 'formik'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { FieldsetGroup, FieldsetGroupSpinner } from '../../shared/FieldsetGroup'
import { FieldsetGroupSeparator } from '../../shared/FieldsetGroupSeparator'

import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'
import type { Specy } from 'domain/types/specy'

const DISCARD_REASON_OPTIONS: Array<Option<string>> = Object.entries(DISCARD_REASON_LABEL).map(([code, label]) => ({
  label: `${code} - ${label}`,
  value: code
}))

export function DiscardedSpeciesField() {
  const { values } = useFormikContext<MissionActionFormValues>()
  const [input, , helper] = useField<MissionActionFormValues['discardedSpecies']>('discardedSpecies')

  const getSpeciesApiQuery = useGetSpeciesQuery()
  const getFaoAreasQuery = useGetFaoAreasQuery()

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
              { name: 'value.code', weight: 0.9 },
              { name: 'value.name', weight: 0.1 }
            ],
            { cacheKey: 'SPECIES_AS_OPTIONS', isStrict: true }
          )
        : undefined,
    [getSpeciesApiQuery.data, speciesAsOptions]
  )

  const getSpecyNameFromSpecyCode = useCallback(
    (specyCode: Specy['code']) => getSpeciesApiQuery.data?.species.find(({ code }) => code === specyCode)?.name ?? '',
    [getSpeciesApiQuery.data]
  )

  /** Groups discard entries by species code while preserving each entry's absolute index in the array. */
  const groups: Array<[string, number[]]> = useMemo(() => {
    const indicesBySpecies = new Map<string, number[]>()
    ;(input.value ?? []).forEach((entry, index) => {
      const indices = indicesBySpecies.get(entry.speciesCode) ?? []
      indices.push(index)
      indicesBySpecies.set(entry.speciesCode, indices)
    })

    return Array.from(indicesBySpecies.entries())
  }, [input.value])

  const makeEmptyDiscard = (speciesCode: string): MissionAction.SpeciesControl => ({
    controlledWeight: undefined,
    declaredWeight: undefined,
    discardReason: undefined,
    faoZones: values.faoAreas,
    nbFish: undefined,
    presentationCodes: undefined,
    rejectedWeight: undefined,
    speciesCode,
    underSized: false,
    underSizedWeight: undefined
  })

  const addSpecies = (newSpecy: Specy | undefined) => {
    if (!newSpecy) {
      return
    }

    helper.setValue([...(input.value ?? []), makeEmptyDiscard(newSpecy.code)])
  }

  const addDiscard = (speciesCode: string) => {
    helper.setValue([...(input.value ?? []), makeEmptyDiscard(speciesCode)])
  }

  const removeDiscard = (index: number) => {
    if (!input.value) {
      throw new FrontendError('`input.value` is undefined')
    }

    helper.setValue(input.value.filter((_, currentIndex) => currentIndex !== index))
  }

  const removeSpecies = (speciesCode: string) => {
    if (!input.value) {
      throw new FrontendError('`input.value` is undefined')
    }

    helper.setValue(input.value.filter(specy => specy.speciesCode !== speciesCode))
  }

  if (!speciesAsOptions.length || !customSearch) {
    return <FieldsetGroupSpinner isLight legend="Rejets" />
  }

  return (
    <FieldsetGroup isLight legend="Rejets">
      {groups.length > 0 && (
        <>
          {groups.map(([speciesCode, indices], groupIndex) => (
            <Row key={`discardedSpecies-${speciesCode}`} $isLast={groupIndex + 1 === groups.length}>
              <TagRow>
                <StyledSingleTag onDelete={() => removeSpecies(speciesCode)}>
                  {`${speciesCode} - ${getSpecyNameFromSpecyCode(speciesCode)}`}
                </StyledSingleTag>
                <AddButton accent={Accent.SECONDARY} Icon={Icon.Plus} onClick={() => addDiscard(speciesCode)}>
                  Ajouter rejet
                </AddButton>
              </TagRow>

              {indices.map(index => (
                <FieldsRow key={`discardedSpecies-${speciesCode}-${index}`}>
                  <StyledSelect
                    label="Nature du rejet"
                    name={`discardedSpecies[${index}].discardReason`}
                    options={DISCARD_REASON_OPTIONS}
                  />
                  <FormikNumberInput label="Qté rejetée" name={`discardedSpecies[${index}].rejectedWeight`} />
                  <StyledCheckPicker
                    isRequired
                    label="Zone de pêche"
                    name={`discardedSpecies[${index}].faoZones`}
                    options={faoAreasAsOptions}
                    searchable
                  />
                  {indices.length > 1 && (
                    <DeleteButton
                      accent={Accent.SECONDARY}
                      Icon={Icon.Delete}
                      onClick={() => removeDiscard(index)}
                      title="Retirer le rejet"
                    />
                  )}
                </FieldsRow>
              ))}
            </Row>
          ))}
          <FieldsetGroupSeparator marginBottom={14} />
        </>
      )}

      <Select
        key={String(input.value?.length)}
        customSearch={customSearch}
        label="Ajouter une espèce rejetée"
        name="newDiscardedSpecy"
        onChange={addSpecies}
        options={speciesAsOptions}
        optionValueKey="code"
        searchable
        virtualized
      />
    </FieldsetGroup>
  )
}

const StyledSelect = styled(FormikSelect)`
  min-width: 200px;
`

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
