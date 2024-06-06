import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { FormikNumberInput, Select, SingleTag } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { Fragment } from 'react/jsx-runtime'
import styled from 'styled-components'

import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES } from '../constants'

import type { PriorNotification } from '../../../PriorNotification.types'

export function FormikFishingCatchesMultiSelect() {
  const [input, , helper] = useField<PriorNotification.PriorNotificationDataFishingCatch[]>('fishingCatches')
  const { speciesAsOptions } = useGetSpeciesAsOptions()

  const filteredSpeciesAsOptions = speciesAsOptions?.filter(specyOption =>
    input.value.every(fishingCatch => fishingCatch.specyCode !== specyOption.value)
  )

  const add = (specyCode: string | undefined) => {
    const specyOption = speciesAsOptions?.find(({ value }) => value === specyCode)
    if (!specyOption) {
      return
    }

    const nextFishingCatches = [
      ...input.value,
      ...(specyCode === 'BFT'
        ? [
            {
              quantity: undefined,
              specyCode: 'BFT',
              specyName: specyOption.label,
              weight: 0
            },
            {
              quantity: 0,
              specyCode: 'BF1',
              specyName: specyOption.label,
              weight: 0
            },
            {
              quantity: 0,
              specyCode: 'BF2',
              specyName: specyOption.label,
              weight: 0
            },
            {
              quantity: 0,
              specyCode: 'BF3',
              specyName: specyOption.label,
              weight: 0
            }
          ]
        : [
            {
              quantity: undefined,
              specyCode: specyOption.value,
              specyName: specyOption.label,
              weight: 0
            }
          ])
    ]

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
        label="Espèces à débarquer"
        name="portLocode"
        onChange={add}
        options={filteredSpeciesAsOptions ?? []}
        searchable
        virtualized
      />

      <Wrapper>
        {input.value.map((fishingCatch, index) => (
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

                  {/* BFT - Bluefin Tuna => + BF1, BF2, BF3 */}
                  {fishingCatch.specyCode === 'BFT' && (
                    <>
                      {BLUEFIN_TUNA_EXTENDED_SPECY_CODES.forEach((extendedSpecyCode, extendedIndex) => (
                        <Double key={extendedSpecyCode}>
                          <InputRow>
                            <FormikNumberInput
                              isLabelHidden
                              label={`Quantité (${extendedSpecyCode})`}
                              name={`fishingCatches[${index + extendedIndex + 1}].quantity`}
                            />
                            pc
                          </InputRow>
                          <InputRow>
                            <FormikNumberInput
                              isLabelHidden
                              label={`Poids (${extendedSpecyCode})`}
                              name={`fishingCatches[${index + extendedIndex + 1}].weight`}
                            />
                            kg
                          </InputRow>
                        </Double>
                      ))}
                    </>
                  )}

                  {/* SWC - Swordfish */}
                  {fishingCatch.specyCode === 'SWC' && (
                    <InputRow>
                      <FormikNumberInput
                        isLabelHidden
                        label={`Quantité (${fishingCatch.specyCode})`}
                        name={`fishingCatches[${index}].quantity`}
                      />
                      pc
                    </InputRow>
                  )}
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

const Double = styled.div`
  display: flex;
  gap: 8px;

  > div {
    max-width: 50%;
    width: 50%;
  }
`

const InputRow = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.gainsboro};
  color: ${p => p.theme.color.slateGray};
  display: flex;
  padding-right: 8px;

  > .Field-NumberInput {
    flex-grow: 1;
    margin-right: 8px;

    > input {
      border: none !important;
      padding: 6px 8px 4px;
    }
  }
`
