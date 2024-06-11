import { useGetSpeciesQuery } from '@api/specy'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { FormikNumberInput, Select, SingleTag } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useField } from 'formik'
import { Fragment } from 'react/jsx-runtime'
import styled from 'styled-components'

import { InputRow } from './styles'
import { getFishingsCatchesExtraFields, sortFishingCatches } from './utils'
import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES } from '../../constants'
import { getFishingsCatchesInitialValues } from '../../utils'

import type { PriorNotification } from '../../../../PriorNotification.types'

// TODO Is the species name really useful since the Backend fills it?
export function FormikFishingCatchesMultiSelect() {
  const [input, , helper] = useField<PriorNotification.PriorNotificationDataFishingCatch[]>('fishingCatches')
  const { speciesAsOptions } = useGetSpeciesAsOptions()
  const { data: speciesAndGroups } = useGetSpeciesQuery()

  const filteredSpeciesAsOptions = speciesAsOptions?.filter(specyOption =>
    input.value.every(fishingCatch => fishingCatch.specyCode !== specyOption.value)
  )
  const sortedFishingCatches = input.value.sort(sortFishingCatches)

  const add = (specyCode: string | undefined) => {
    const specyOption = speciesAsOptions?.find(({ value }) => value === specyCode)
    if (!specyOption) {
      return
    }

    const specyName = speciesAndGroups?.species.find(specy => specy.code === specyOption.value)?.name
    assertNotNullish(specyName)
    const nextFishingCatches = [...input.value, ...getFishingsCatchesInitialValues(specyOption.value, specyName)]

    helper.setValue(nextFishingCatches)
  }

  const remove = (specyCode: string | undefined) => {
    const nextFishingCatches = input.value.filter(fishingCatch =>
      specyCode === 'BFT'
        ? !['BFT', 'BF1', 'BF2', 'BF3'].includes(fishingCatch.specyCode)
        : fishingCatch.specyCode !== specyCode
    )

    helper.setValue(nextFishingCatches)
  }

  return (
    <>
      <Select
        disabled={!filteredSpeciesAsOptions}
        label="Espèces à bord et à débarquer"
        name="fishingCatches"
        onChange={add}
        options={filteredSpeciesAsOptions ?? []}
        searchable
        virtualized
      />

      <Wrapper>
        {sortedFishingCatches.map((fishingCatch, index) => (
          <Fragment key={fishingCatch.specyCode}>
            {!BLUEFIN_TUNA_EXTENDED_SPECY_CODES.includes(fishingCatch.specyCode) && (
              <Block>
                <SingleTag
                  onDelete={() => remove(fishingCatch.specyCode)}
                >{`${fishingCatch.specyCode} – ${fishingCatch.specyName}`}</SingleTag>

                <div>
                  <InputRow>
                    <FormikNumberInput
                      isLabelHidden
                      label={`Poids (${fishingCatch.specyCode})`}
                      name={`fishingCatches[${index}].weight`}
                    />
                    kg
                  </InputRow>

                  {getFishingsCatchesExtraFields(fishingCatch.specyCode, index)}
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
