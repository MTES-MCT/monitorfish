import { FormikNumberInput, usePrevious } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { isEqual } from 'lodash'
import { sum } from 'lodash/fp'
import { useEffect } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

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

  const previousFishingCatches = usePrevious(input.value)

  const updateBluefinTunaWeightAndTotal = useDebouncedCallback(
    () => {
      const totalWeight = sum(
        input.value
          .filter(fishingCatch => BLUEFIN_TUNA_EXTENDED_SPECY_CODES.includes(fishingCatch.specyCode))
          .map(({ weight }) => weight ?? 0)
      )

      const nextFishingCatchesWithTotal = input.value.map(fichingCatch => {
        if (fichingCatch.specyCode === BLUEFIN_TUNA_SPECY_CODE) {
          return {
            ...fichingCatch,
            weight: totalWeight
          }
        }

        return fichingCatch
      })

      helper.setValue(nextFishingCatchesWithTotal)
    },
    250,
    {
      trailing: true
    }
  )

  useEffect(() => {
    if (
      !input.value.find(fishingCatch => fishingCatch.specyCode === BLUEFIN_TUNA_SPECY_CODE) ||
      isEqual(input.value, previousFishingCatches)
    ) {
      return
    }

    updateBluefinTunaWeightAndTotal()
  }, [input.value, previousFishingCatches, updateBluefinTunaWeightAndTotal])

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
                  key={`quantity-${extendedSpecyCode}-${index})`}
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
                <FormikNumberInput
                  key={`weight-${extendedSpecyCode}-${index})`}
                  areArrowsHidden
                  isErrorMessageHidden
                  isLabelHidden
                  label={`Poids (${extendedSpecyCode})`}
                  name={`fishingCatches[${index}].weight`}
                  readOnly={isReadOnly}
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
