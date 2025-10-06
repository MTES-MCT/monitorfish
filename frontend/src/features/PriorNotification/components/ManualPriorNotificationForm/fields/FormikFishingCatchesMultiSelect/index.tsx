import { useGetSpeciesQuery } from '@api/specy'
import { FieldsetGroupSpinner } from '@features/Mission/components/MissionForm/shared/FieldsetGroup'
import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES } from '@features/PriorNotification/constants'
import { useGetFaoAreasAsOptions } from '@hooks/useGetFaoAreasAsOptions'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { CustomSearch } from '@mtes-mct/monitor-ui'
import { FieldArray } from 'formik'
import { useMemo } from 'react'

import { FormikMainField } from './FormikMainField'

type FormikFishingCatchesMultiSelectProps = Readonly<{
  isReadOnly: boolean
}>
export function FormikFishingCatchesMultiSelect({ isReadOnly }: FormikFishingCatchesMultiSelectProps) {
  const { speciesAsOptions } = useGetSpeciesAsOptions()
  const { data: speciesAndGroups } = useGetSpeciesQuery()
  const { faoAreasAsOptions } = useGetFaoAreasAsOptions()

  const customSearch = useMemo(() => {
    const speciesAsOptionsWithoutBluefinTunaSpecies = speciesAsOptions?.filter(
      specy => !BLUEFIN_TUNA_EXTENDED_SPECY_CODES.includes(specy.value.code)
    )

    return speciesAsOptionsWithoutBluefinTunaSpecies?.length
      ? new CustomSearch(
          structuredClone(speciesAsOptionsWithoutBluefinTunaSpecies),
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
      : undefined
  }, [speciesAsOptions])

  if (!faoAreasAsOptions || !speciesAsOptions?.length || !speciesAndGroups || !customSearch) {
    return <FieldsetGroupSpinner isLight legend="Espèces à bord et à débarquer" />
  }

  return (
    <FieldArray
      name="fishingCatches"
      render={arrayHelpers => (
        <FormikMainField
          customSearch={customSearch}
          faoAreasAsOptions={faoAreasAsOptions}
          isReadOnly={isReadOnly}
          onArrayHelperPush={arrayHelpers.push}
          onArrayHelperRemove={arrayHelpers.remove}
          speciesAndGroups={speciesAndGroups}
          speciesAsOptions={speciesAsOptions}
        />
      )}
    />
  )
}
