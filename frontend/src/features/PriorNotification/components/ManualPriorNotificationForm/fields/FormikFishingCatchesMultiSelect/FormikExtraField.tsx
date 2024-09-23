import { FormikNumberInput, logSoftError, NumberInput } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { sum, update } from 'lodash'
import { useCallback } from 'react'
import styled from 'styled-components'

import { InputWithUnit, SubRow } from './styles'
import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES, BLUEFIN_TUNA_SPECY_CODE } from '../../../../constants'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

type FormikExtraFieldProps = Readonly<{
  allFishingsCatches: PriorNotification.FormDataFishingCatch[]
  fishingsCatchesIndex: number
  isReadOnly: boolean
  specyCode: string
}>
export function FormikExtraField({
  allFishingsCatches,
  fishingsCatchesIndex,
  isReadOnly,
  specyCode
}: FormikExtraFieldProps) {
  const [input, , helper] = useField<PriorNotification.FormDataFishingCatch[]>('fishingCatches')

  const updateBluefinTunaWeightAndTotal = useCallback(
    (index: number, nextWeight: number | undefined = 0) => {
      const nextFishingCatches: PriorNotification.FormDataFishingCatch[] = update(input.value, index, fishingCatch => ({
        ...fishingCatch,
        weight: nextWeight
      }))

      const totalWeight = sum(
        nextFishingCatches
          .filter(fishingCatch => BLUEFIN_TUNA_EXTENDED_SPECY_CODES.includes(fishingCatch.specyCode))
          .map(({ weight }) => weight)
      )
      const totalWeightIndex = input.value.findIndex(fishingCatch => fishingCatch.specyCode === BLUEFIN_TUNA_SPECY_CODE)
      if (totalWeightIndex === -1) {
        logSoftError({
          isSideWindowError: true,
          message: '`totalWeightIndex` was not found (-1).'
        })
      }

      const nextFishingCatchesWithTotal: PriorNotification.FormDataFishingCatch[] = update(
        nextFishingCatches,
        totalWeightIndex,
        fishingCatch => ({
          ...fishingCatch,
          weight: totalWeight
        })
      )

      helper.setValue(nextFishingCatchesWithTotal)
    },

    // `input.value` is a pointer and `helper` doesn't change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // BFT - Bluefin Tuna => + BF1, BF2, BF3
  if (specyCode === 'BFT') {
    return (
      <>
        {BLUEFIN_TUNA_EXTENDED_SPECY_CODES.map(extendedSpecyCode => {
          const index = allFishingsCatches.findIndex(fishingCatch => fishingCatch.specyCode === extendedSpecyCode)

          return (
            <StyledSubRow key={extendedSpecyCode}>
              <ExtendedSpecyCode>{extendedSpecyCode}</ExtendedSpecyCode>
              <InputWithUnit>
                <FormikNumberInput
                  areArrowsHidden
                  isErrorMessageHidden
                  isLabelHidden
                  label={`Quantité (${extendedSpecyCode})`}
                  name={`fishingCatches[${index}].quantity`}
                  readOnly={isReadOnly}
                />
                pc
              </InputWithUnit>
              <InputWithUnit>
                <NumberInput
                  areArrowsHidden
                  isErrorMessageHidden
                  isLabelHidden
                  label={`Poids (${extendedSpecyCode})`}
                  name={`fishingCatches[${index}].weight`}
                  onChange={nextWeight => updateBluefinTunaWeightAndTotal(index, nextWeight)}
                  readOnly={isReadOnly}
                  value={input.value[index]?.weight}
                />
                kg
              </InputWithUnit>
            </StyledSubRow>
          )
        })}
      </>
    )
  }

  // SWO - Swordfish
  if (specyCode === 'SWO') {
    return (
      <StyledSubRow key="SWO">
        <InputWithUnit>
          <FormikNumberInput
            areArrowsHidden
            isLabelHidden
            label={`Quantité (${specyCode})`}
            name={`fishingCatches[${fishingsCatchesIndex}].quantity`}
            readOnly={isReadOnly}
          />
          pc
        </InputWithUnit>
      </StyledSubRow>
    )
  }

  return <></>
}

const StyledSubRow = styled(SubRow)`
  align-items: center;
  justify-content: flex-end;
`

const ExtendedSpecyCode = styled.span`
  color: ${p => p.theme.color.slateGray};
`
