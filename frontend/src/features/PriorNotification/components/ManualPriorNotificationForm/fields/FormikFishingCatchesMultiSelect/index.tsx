import { useGetSpeciesQuery } from '@api/specy'
import { FieldsetGroupSpinner } from '@features/Mission/components/MissionForm/shared/FieldsetGroup'
import { useGetFaoAreasAsOptions } from '@hooks/useGetFaoAreasAsOptions'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { CustomSearch, FormikNumberInput, FormikSelect, Select, SingleTag } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useFormikContext } from 'formik'
import { useMemo } from 'react'
import { Fragment } from 'react/jsx-runtime'
import styled from 'styled-components'

import { FormikExtraField } from './FormikExtraField'
import { InputWithUnit, SubRow } from './styles'
import { getFishingsCatchesValidationError } from './utils'
import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES } from '../../constants'
import { getFishingsCatchesInitialValues } from '../../utils'

import type { Specy } from '../../../../../../domain/types/specy'
import type { ManualPriorNotificationFormValues } from '../../types'

// TODO Is the species name really useful since the Backend fills it?
type FormikFishingCatchesMultiSelectProps = Readonly<{
  isReadOnly: boolean
}>
export function FormikFishingCatchesMultiSelect({ isReadOnly }: FormikFishingCatchesMultiSelectProps) {
  const { errors, setFieldValue, values } = useFormikContext<ManualPriorNotificationFormValues>()
  const { speciesAsOptions } = useGetSpeciesAsOptions()
  const { data: speciesAndGroups } = useGetSpeciesQuery()
  const { faoAreasAsOptions } = useGetFaoAreasAsOptions()

  const validationError = getFishingsCatchesValidationError(errors)

  const customSearch = useMemo(
    () =>
      speciesAsOptions?.length
        ? new CustomSearch(
            speciesAsOptions,
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
    [speciesAsOptions]
  )

  const add = (nextSpecy: Specy | undefined) => {
    const specyIsAlreadyInCatches = values.fishingCatches?.find(
      fishingCatch => fishingCatch.specyCode === nextSpecy?.code
    )
    if (specyIsAlreadyInCatches) {
      return
    }

    const specyOption = speciesAsOptions?.find(({ value }) => value.code === nextSpecy?.code)
    if (!specyOption) {
      return
    }

    const specyName = speciesAndGroups?.species.find(specy => specy.code === specyOption.value.code)?.name
    assertNotNullish(specyName)
    const nextFishingCatches = [
      ...values.fishingCatches,
      ...getFishingsCatchesInitialValues(specyOption.value.code, specyName)
    ]

    setFieldValue('fishingCatches', nextFishingCatches)
  }

  const remove = (specyCode: string | undefined) => {
    if (isReadOnly) {
      return
    }

    const nextFishingCatches = values.fishingCatches.filter(fishingCatch =>
      specyCode === 'BFT'
        ? !['BFT', ...BLUEFIN_TUNA_EXTENDED_SPECY_CODES].includes(fishingCatch.specyCode)
        : fishingCatch.specyCode !== specyCode
    )

    setFieldValue('fishingCatches', nextFishingCatches)
  }

  if (!speciesAsOptions?.length || !customSearch) {
    return <FieldsetGroupSpinner isLight legend="Espèces à bord et à débarquer" />
  }

  return (
    <>
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

      <Wrapper>
        {values.fishingCatches.map((fishingCatch, index) => (
          <Fragment key={fishingCatch.specyCode}>
            {!BLUEFIN_TUNA_EXTENDED_SPECY_CODES.includes(fishingCatch.specyCode) && (
              <Row>
                <SubRow>
                  <SpecyTag
                    onDelete={() => remove(fishingCatch.specyCode)}
                  >{`${fishingCatch.specyCode} – ${fishingCatch.specyName}`}</SpecyTag>

                  {!values.hasGlobalFaoArea && (
                    <FormikSelect
                      disabled={!speciesAsOptions}
                      isErrorMessageHidden
                      isLabelHidden
                      label={`Zone de capture (${fishingCatch.specyCode})`}
                      name={`fishingCatches[${index}].faoArea`}
                      options={faoAreasAsOptions ?? []}
                      placeholder="Choisir une zone"
                      readOnly={isReadOnly}
                      searchable
                      virtualized
                    />
                  )}

                  <InputWithUnit>
                    <FormikNumberInput
                      isErrorMessageHidden
                      isLabelHidden
                      label={`Poids (${fishingCatch.specyCode})`}
                      name={`fishingCatches[${index}].weight`}
                      readOnly={isReadOnly}
                    />
                    kg
                  </InputWithUnit>
                </SubRow>

                <FormikExtraField
                  allFishingsCatches={values.fishingCatches}
                  fishingsCatchesIndex={index}
                  specyCode={fishingCatch.specyCode}
                />
              </Row>
            )}
          </Fragment>
        ))}
      </Wrapper>
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
`

const SpecyTag = styled(SingleTag)`
  margin-top: 2px;
  max-width: 220px;
  min-width: 220px;
`
