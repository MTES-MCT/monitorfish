import { BLUEFIN_TUNA_SPECY_CODE, SWORDFISH_SPECY_CODE } from '@features/PriorNotification/constants'
import { CustomSearch, FormikNumberInput, FormikSelect, Select, SingleTag, type Option } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useFormikContext, type ArrayHelpers } from 'formik'
import styled from 'styled-components'

import { FormikExtraField } from './FormikExtraField'
import { SubRow } from './styles'
import { getFishingsCatchesValidationError } from './utils'
import { getFishingsCatchesInitialValues } from '../../utils'

import type { SpeciesAndSpeciesGroupsAPIData, Specy } from '../../../../../../domain/types/specy'
import type { ManualPriorNotificationFormValues } from '../../types'

type FormikMainFieldProps = Readonly<{
  customSearch: CustomSearch<Option<Specy>>
  faoAreasAsOptions: Option[]
  isReadOnly: boolean
  onArrayHelperPush: ArrayHelpers['push']
  onArrayHelperRemove: ArrayHelpers['remove']
  speciesAndGroups: SpeciesAndSpeciesGroupsAPIData
  speciesAsOptions: Option<Specy>[]
}>
export function FormikMainField({
  customSearch,
  faoAreasAsOptions,
  isReadOnly,
  onArrayHelperPush,
  onArrayHelperRemove,
  speciesAndGroups,
  speciesAsOptions
}: FormikMainFieldProps) {
  const { errors, values } = useFormikContext<ManualPriorNotificationFormValues>()

  const validationError = getFishingsCatchesValidationError(errors)

  const add = (nextSpecy: Specy | undefined) => {
    if (values.hasGlobalFaoArea) {
      const isSpecyCodeAlreadyInCatches = values.fishingCatches?.find(
        fishingCatch => fishingCatch.specyCode === nextSpecy?.code
      )
      if (isSpecyCodeAlreadyInCatches) {
        return
      }
    }

    const specyOption = speciesAsOptions.find(({ value }) => value.code === nextSpecy?.code)
    if (!specyOption) {
      return
    }

    const specyName = speciesAndGroups?.species.find(specy => specy.code === specyOption.value.code)?.name
    assertNotNullish(specyName)
    const newFishingCatch = getFishingsCatchesInitialValues(specyOption.value.code, specyName)

    onArrayHelperPush(newFishingCatch)
  }

  return (
    <>
      <Wrapper>
        {values.fishingCatches.map((fishingCatch, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Row key={`extra-field-${fishingCatch.specyCode}-${fishingCatch.faoArea}-${index}`}>
            <SubRow>
              <SpecyTag
                onDelete={() => onArrayHelperRemove(index)}
              >{`${fishingCatch.specyCode} – ${fishingCatch.specyName}`}</SpecyTag>

              {!values.hasGlobalFaoArea && (
                <FormikSelect
                  disabled={!speciesAsOptions}
                  isErrorMessageHidden
                  isLabelHidden
                  label={`Zone de capture (${fishingCatch.specyCode})`}
                  name={`fishingCatches[${index}].faoArea`}
                  options={faoAreasAsOptions ?? []}
                  placeholder="Zone"
                  readOnly={isReadOnly}
                  searchable
                  virtualized
                />
              )}

              <FormikNumberInput
                areArrowsHidden
                isErrorMessageHidden
                isLabelHidden
                label={`Poids (${fishingCatch.specyCode})`}
                name={`fishingCatches[${index}].weight`}
                readOnly={isReadOnly || fishingCatch.specyCode === BLUEFIN_TUNA_SPECY_CODE}
                title={
                  fishingCatch.specyCode === BLUEFIN_TUNA_SPECY_CODE
                    ? 'Le poids total est calculé à partir des poids saisis dans les cases BF1, BF2, BF3'
                    : undefined
                }
                unit="kg"
              />
            </SubRow>

            {[BLUEFIN_TUNA_SPECY_CODE, SWORDFISH_SPECY_CODE].includes(fishingCatch.specyCode) && (
              <FormikExtraField fishingCatchIndex={index} isReadOnly={isReadOnly} />
            )}
          </Row>
        ))}
      </Wrapper>

      <Select
        key={String(values.fishingCatches?.length)}
        customSearch={customSearch}
        disabled={!speciesAsOptions}
        error={validationError}
        label="Espèces à bord et à débarquer"
        name="fishingCatches"
        onChange={add}
        options={speciesAsOptions ?? []}
        optionValueKey="code"
        readOnly={isReadOnly}
        searchable
        virtualized
      />
    </>
  )
}

const Wrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  * {
    box-sizing: border-box;
  }
`

const Row = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 24px;
  row-gap: 8px;

  .Field-NumberInput {
    max-width: 96px;
    min-width: 96px;
  }
`

const SpecyTag = styled(SingleTag)`
  margin-top: 2px;
  max-width: 260px;
  min-width: 260px;
`
