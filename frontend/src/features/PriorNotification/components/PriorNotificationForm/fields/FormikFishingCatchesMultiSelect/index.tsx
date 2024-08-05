import { useGetSpeciesQuery } from '@api/specy'
import { FieldsetGroupSpinner } from '@features/Mission/components/MissionForm/shared/FieldsetGroup'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { CustomSearch, FormikNumberInput, Select, SingleTag } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useField } from 'formik'
import { useMemo } from 'react'
import { Fragment } from 'react/jsx-runtime'
import styled from 'styled-components'

import { InputRow } from './styles'
import { getFishingsCatchesExtraFields } from './utils'
import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES } from '../../constants'
import { getFishingsCatchesInitialValues } from '../../utils'

import type { Specy } from '../../../../../../domain/types/specy'
import type { PriorNotification } from '../../../../PriorNotification.types'

// TODO Is the species name really useful since the Backend fills it?
type FormikFishingCatchesMultiSelectProps = {
  readOnly?: boolean | undefined
}
export function FormikFishingCatchesMultiSelect({ readOnly }: FormikFishingCatchesMultiSelectProps) {
  const [input, meta, helper] = useField<PriorNotification.PriorNotificationDataFishingCatch[]>('fishingCatches')
  const { speciesAsOptions } = useGetSpeciesAsOptions()
  const { data: speciesAndGroups } = useGetSpeciesQuery()

  const filteredSpeciesAsOptions = useMemo(
    () =>
      speciesAsOptions?.filter(specyOption =>
        input.value.every(fishingCatch => fishingCatch.specyCode !== specyOption.value.code)
      ) ?? [],
    [speciesAsOptions, input.value]
  )

  const add = (nextSpecy: Specy | undefined) => {
    const specyOption = speciesAsOptions?.find(({ value }) => value.code === nextSpecy?.code)
    if (!specyOption) {
      return
    }

    const specyName = speciesAndGroups?.species.find(specy => specy.code === specyOption.value.code)?.name
    assertNotNullish(specyName)
    const nextFishingCatches = [...input.value, ...getFishingsCatchesInitialValues(specyOption.value.code, specyName)]

    helper.setValue(nextFishingCatches)
  }

  const remove = (specyCode: string | undefined) => {
    const nextFishingCatches = input.value.filter(fishingCatch =>
      specyCode === 'BFT'
        ? !['BFT', ...BLUEFIN_TUNA_EXTENDED_SPECY_CODES].includes(fishingCatch.specyCode)
        : fishingCatch.specyCode !== specyCode
    )

    helper.setValue(nextFishingCatches)
  }

  const customSearch = useMemo(
    () =>
      filteredSpeciesAsOptions.length
        ? new CustomSearch(
            filteredSpeciesAsOptions,
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
            { cacheKey: 'PNO_SPECIES_AS_OPTIONS', isStrict: true }
          )
        : undefined,
    [filteredSpeciesAsOptions]
  )

  if (!filteredSpeciesAsOptions.length || !customSearch) {
    return <FieldsetGroupSpinner isLight legend="Espèces à bord et à débarquer" />
  }

  return (
    <>
      <Select
        customSearch={customSearch}
        disabled={!filteredSpeciesAsOptions}
        error={meta.error}
        label="Espèces à bord et à débarquer"
        name="fishingCatches"
        onChange={add}
        options={filteredSpeciesAsOptions ?? []}
        optionValueKey="code"
        readOnly={readOnly}
        virtualized
      />

      <Wrapper>
        {input.value.map((fishingCatch, index) => (
          <Fragment key={fishingCatch.specyCode}>
            {!BLUEFIN_TUNA_EXTENDED_SPECY_CODES.includes(fishingCatch.specyCode) && (
              <Block>
                <SingleTag
                  onDelete={() => {
                    if (readOnly) {
                      return
                    }

                    remove(fishingCatch.specyCode)
                  }}
                >{`${fishingCatch.specyCode} – ${fishingCatch.specyName}`}</SingleTag>

                <div>
                  <InputRow>
                    <FormikNumberInput
                      isLabelHidden
                      label={`Poids (${fishingCatch.specyCode})`}
                      name={`fishingCatches[${index}].weight`}
                      readOnly={readOnly}
                    />
                    kg
                  </InputRow>

                  {getFishingsCatchesExtraFields(fishingCatch.specyCode, index, input.value)}
                </div>
              </Block>
            )}
          </Fragment>
        ))}
      </Wrapper>
    </>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const Block = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 16px;
  margin-top: 24px;

  > div {
    max-width: 50%;
    width: 50%;

    &:last-child {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
`
