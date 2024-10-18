import { FormikNumberInput, usePrevious } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { isEqual } from 'lodash'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { SubRow } from './styles'
import { BLUEFIN_TUNA_SPECY_CODE } from '../../../../constants'

import type { ManualPriorNotificationFormValuesFishingCatch } from '../../types'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

type FormikExtraFieldProps = Readonly<{
  fishingCatchIndex: number
  isReadOnly: boolean
}>
export function FormikExtraField({ fishingCatchIndex, isReadOnly }: FormikExtraFieldProps) {
  const [input, , helper] = useField<ManualPriorNotificationFormValuesFishingCatch>(
    `fishingCatches[${fishingCatchIndex}]`
  )

  const fishingCatch = input.value
  const previousFishingCatch = usePrevious(fishingCatch)

  const updateBluefinTunaWeightAndTotal = useCallback(
    (fishinCatch: ManualPriorNotificationFormValuesFishingCatch) => {
      if (!fishinCatch.$bluefinTunaExtendedCatch) {
        return
      }

      const totalWeight =
        (fishinCatch.$bluefinTunaExtendedCatch.BF1.weight ?? 0) +
        (fishinCatch.$bluefinTunaExtendedCatch.BF2.weight ?? 0) +
        (fishinCatch.$bluefinTunaExtendedCatch.BF3.weight ?? 0)

      const nextFishingCatch: PriorNotification.FormDataFishingCatch = {
        ...fishinCatch,
        weight: totalWeight
      }

      helper.setValue(nextFishingCatch)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    if (fishingCatch?.specyCode !== BLUEFIN_TUNA_SPECY_CODE || isEqual(fishingCatch, previousFishingCatch)) {
      return
    }

    updateBluefinTunaWeightAndTotal(fishingCatch)
  }, [fishingCatch, previousFishingCatch, updateBluefinTunaWeightAndTotal])

  if (!fishingCatch) {
    return <></>
  }

  return (
    <>
      <StyledSubRow>
        <ExtendedSpecyCode>BF1</ExtendedSpecyCode>

        <FormikNumberInput
          areArrowsHidden
          isErrorMessageHidden
          isLabelHidden
          label="Quantité (BF1)"
          name={`fishingCatches[${fishingCatchIndex}].$bluefinTunaExtendedCatch.BF1.quantity`}
          readOnly={isReadOnly}
          unit="pc"
        />

        <FormikNumberInput
          areArrowsHidden
          isErrorMessageHidden
          isLabelHidden
          label="Poids (BF1)"
          name={`fishingCatches[${fishingCatchIndex}].$bluefinTunaExtendedCatch.BF1.weight`}
          readOnly={isReadOnly}
          unit="kg"
        />
      </StyledSubRow>
      <StyledSubRow>
        <ExtendedSpecyCode>BF2</ExtendedSpecyCode>

        <FormikNumberInput
          areArrowsHidden
          isErrorMessageHidden
          isLabelHidden
          label="Quantité (BF2)"
          name={`fishingCatches[${fishingCatchIndex}].$bluefinTunaExtendedCatch.BF2.quantity`}
          readOnly={isReadOnly}
          unit="pc"
        />

        <FormikNumberInput
          areArrowsHidden
          isErrorMessageHidden
          isLabelHidden
          label="Poids (BF2)"
          name={`fishingCatches[${fishingCatchIndex}].$bluefinTunaExtendedCatch.BF2.weight`}
          readOnly={isReadOnly}
          unit="kg"
        />
      </StyledSubRow>
      <StyledSubRow>
        <ExtendedSpecyCode>BF3</ExtendedSpecyCode>

        <FormikNumberInput
          areArrowsHidden
          isErrorMessageHidden
          isLabelHidden
          label="Quantité (BF3)"
          name={`fishingCatches[${fishingCatchIndex}].$bluefinTunaExtendedCatch.BF3.quantity`}
          readOnly={isReadOnly}
          unit="pc"
        />

        <FormikNumberInput
          areArrowsHidden
          isErrorMessageHidden
          isLabelHidden
          label="Poids (BF3)"
          name={`fishingCatches[${fishingCatchIndex}].$bluefinTunaExtendedCatch.BF3.weight`}
          readOnly={isReadOnly}
          unit="kg"
        />
      </StyledSubRow>
    </>
  )
}

export const StyledSubRow = styled(SubRow)`
  align-items: center;
  justify-content: flex-end;
`

const ExtendedSpecyCode = styled.span`
  color: ${p => p.theme.color.slateGray};
`
