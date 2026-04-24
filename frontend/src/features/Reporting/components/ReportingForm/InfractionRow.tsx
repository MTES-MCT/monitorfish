import { useGetThreatCharacterizationAsTreeOptions } from '@features/Infraction/hooks/useGetThreatCharacterizationAsTreeOptions'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { Accent, CheckTreePicker, Icon, IconButton, THEME } from '@mtes-mct/monitor-ui'
import { useFormikContext, type FormikErrors } from 'formik'
import styled from 'styled-components'

import type { FormEditedReporting, InfractionSuspicion } from '../../types'

export type InfractionSuspicionFormValues = Extract<FormEditedReporting, { type: ReportingType.INFRACTION_SUSPICION }>
export type InfractionSuspicionFormErrors = FormikErrors<InfractionSuspicionFormValues>

export function InfractionRow({
  errors,
  index,
  isFirst,
  isLight,
  onRemove
}: {
  errors: InfractionSuspicionFormErrors | undefined
  index: number
  isFirst: boolean
  isLight: boolean
  onRemove: () => void
}) {
  const { setFieldValue, values } = useFormikContext<InfractionSuspicionFormValues>()
  const infractions = values.infractions ?? []
  const infractionValue = infractions[index]
  const infractionErrors = errors?.infractions
  const rowErrors =
    infractionErrors && typeof infractionErrors !== 'string'
      ? (infractionErrors as FormikErrors<InfractionSuspicion['infractions'][number]>[])[index]
      : undefined
  const rowError = rowErrors ? rowErrors.threatHierarchy : undefined
  const threatCharacterizationOptions = useGetThreatCharacterizationAsTreeOptions(
    infractionValue?.threatHierarchy ? [infractionValue.threatHierarchy] : undefined
  )

  return (
    <InfractionRowWrapper $isFirst={isFirst}>
      <CheckTreePicker
        error={rowError as string | undefined}
        isLight={isLight}
        isRequired={isFirst}
        isSelect
        label={`Type d'infraction et NATINF ${index + 1}`}
        name={`infractions[${index}].threatHierarchy`}
        onChange={nextThreats => {
          if (nextThreats && nextThreats.length > 0) {
            setFieldValue(`infractions[${index}].threatHierarchy`, nextThreats[0])
          } else {
            setFieldValue(`infractions[${index}].threatHierarchy`, undefined)
          }
        }}
        options={threatCharacterizationOptions}
        placement="autoVertical"
        searchable
        value={infractionValue?.threatHierarchy ? [infractionValue.threatHierarchy] : undefined}
      />
      {!isFirst && (
        <IconButton
          accent={Accent.SECONDARY}
          color={THEME.color.maximumRed}
          Icon={Icon.Delete}
          onClick={onRemove}
          title="Supprimer"
          type="button"
        />
      )}
    </InfractionRowWrapper>
  )
}

const InfractionRowWrapper = styled.div<{ $isFirst: boolean }>`
  display: flex;
  gap: 8px;

  .Element-IconButton {
    height: 32px;
    margin-top: 20px;
  }

  .Field-CheckTreePicker {
    width: ${p => (p.$isFirst ? '100%' : 'calc(100% - 32px - 8px)')};
  }
`
