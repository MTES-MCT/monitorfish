import { useGetFaoAreasAsOptions } from '@hooks/useGetFaoAreasAsOptions'
import { FormikMultiRadio, FormikSelect, usePrevious } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { omit } from 'lodash'
import { useEffect } from 'react'
import styled from 'styled-components'

import { HAS_GLOBAL_FAO_AREA_AS_OPTIONS } from './constants'

import type { ManualPriorNotificationFormValues } from '../../types'

type FormikFaoAreaSelectProps = Readonly<{
  isReadOnly: boolean
}>
export function FormikFaoAreaSelect({ isReadOnly }: FormikFaoAreaSelectProps) {
  const { setFieldValue, values } = useFormikContext<ManualPriorNotificationFormValues>()
  const { faoAreasAsOptions } = useGetFaoAreasAsOptions()

  const hadGlobalFaoArea = usePrevious(values.hasGlobalFaoArea)

  useEffect(
    () => {
      if (hadGlobalFaoArea === undefined || values.hasGlobalFaoArea === hadGlobalFaoArea) {
        return
      }

      if (values.hasGlobalFaoArea === false) {
        setFieldValue('globalFaoArea', undefined)

        return
      }

      const nextFishingCatches = values.fishingCatches.map(fishingCatch => omit(fishingCatch, ['faoArea']))

      setFieldValue('fishingCatches', nextFishingCatches)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hadGlobalFaoArea, values.fishingCatches, values.hasGlobalFaoArea]
  )

  return (
    <>
      <FormikMultiRadio
        isInline
        label="Zones de capture"
        name="hasGlobalFaoArea"
        options={HAS_GLOBAL_FAO_AREA_AS_OPTIONS}
      />

      <FormikSelect
        disabled={!values.hasGlobalFaoArea || !faoAreasAsOptions}
        isLabelHidden
        label="Zone globale de capture"
        name="globalFaoArea"
        options={faoAreasAsOptions ?? []}
        readOnly={isReadOnly}
        searchable
        virtualized
      />
      {!values.hasGlobalFaoArea && (
        <Message>Veuillez saisir les zones de capture lors de l’ajout des espèces à débarquer.</Message>
      )}
    </>
  )
}

const Message = styled.p`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
  margin-top: 8px;
`
