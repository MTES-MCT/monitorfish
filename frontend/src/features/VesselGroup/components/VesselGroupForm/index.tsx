import { DEFAULT_VESSEL_LIST_FILTER_VALUES } from '@features/Vessel/components/VesselList/constants'
import { FormikCirclePicker } from '@features/VesselGroup/components/VesselGroupForm/FormikCirclePicker'
import { FormikSharingOptions } from '@features/VesselGroup/components/VesselGroupForm/FormikSharingOptions'
import { DEFAULT_DYNAMIC_VESSEL_GROUP, DEFAULT_FIXED_VESSEL_GROUP } from '@features/VesselGroup/constants'
import {
  CreateOrUpdateDynamicVesselGroupSchema,
  CreateOrUpdateFixedVesselGroupSchema,
  type DynamicVesselGroupFilter,
  GroupType,
  type CreateOrUpdateDynamicVesselGroup,
  type CreateOrUpdateVesselGroup,
  type VesselIdentityForVesselGroup
} from '@features/VesselGroup/types'
import { addOrUpdateVesselGroup } from '@features/VesselGroup/useCases/addOrUpdateVesselGroup'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import {
  FieldError,
  FormikDatePicker,
  FormikEffect,
  FormikTextarea,
  FormikTextInput,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { toFormikValidationSchema } from '@utils/toFormikValidationSchema'
import { Formik } from 'formik'
import { useRef, type MutableRefObject } from 'react'
import styled from 'styled-components'

import type { FormikProps } from 'formik'
import type { Promisable } from 'type-fest'

type VesselGroupFormProps = {
  editedVesselGroup: CreateOrUpdateVesselGroup | undefined
  formRef: MutableRefObject<FormikProps<CreateOrUpdateVesselGroup>>
  groupType: GroupType
  isMainWindow?: boolean
  listFilterValues?: DynamicVesselGroupFilter
  onChange?: (nextValue: CreateOrUpdateDynamicVesselGroup) => void
  onExit: () => Promisable<void>
  vesselIdentities?: VesselIdentityForVesselGroup[]
}
export function VesselGroupForm({
  editedVesselGroup,
  formRef,
  groupType,
  isMainWindow = false,
  listFilterValues,
  onChange,
  onExit,
  vesselIdentities = []
}: VesselGroupFormProps) {
  const dispatch = useMainAppDispatch()
  const { newWindowContainerRef } = useNewWindow()
  const ref = useRef<HTMLDivElement>(null)

  const newOrEditedVesselGroup = (function () {
    if (editedVesselGroup) {
      return editedVesselGroup
    }

    if (groupType === GroupType.FIXED) {
      return DEFAULT_FIXED_VESSEL_GROUP
    }

    return DEFAULT_DYNAMIC_VESSEL_GROUP
  })()

  const validationSchema =
    groupType === GroupType.FIXED
      ? toFormikValidationSchema(CreateOrUpdateFixedVesselGroupSchema)
      : toFormikValidationSchema(CreateOrUpdateDynamicVesselGroupSchema)

  const handleOnSubmit = async (values: CreateOrUpdateVesselGroup) => {
    const nextValues =
      groupType === GroupType.FIXED
        ? { ...values, vessels: vesselIdentities }
        : { ...values, filters: listFilterValues ?? DEFAULT_VESSEL_LIST_FILTER_VALUES }

    const isSuccess = await dispatch(addOrUpdateVesselGroup(nextValues))
    if (isSuccess) {
      onExit()
    }
  }

  return (
    <div ref={ref}>
      <Formik
        initialValues={newOrEditedVesselGroup}
        innerRef={formRef as MutableRefObject<FormikProps<CreateOrUpdateVesselGroup>>}
        onSubmit={handleOnSubmit}
        validationSchema={validationSchema}
      >
        {({ errors }) => (
          <>
            {isMainWindow && groupType === GroupType.DYNAMIC && (
              <FormikEffect
                onChange={nextValues => {
                  onChange?.(nextValues as CreateOrUpdateDynamicVesselGroup)
                }}
              />
            )}
            <Columns>
              <Column>
                <FormikCirclePicker />
                <StyledFormikTextInput isErrorMessageHidden isRequired label="Nom du groupe" name="name" />
                <StyledFormikTextarea isErrorMessageHidden label="Description du groupe" name="description" rows={3} />
              </Column>
              <Column $width={408}>
                <div>
                  <DatesWrapper>
                    <StyledFormikDatePicker
                      baseContainer={(isMainWindow ? ref.current : newWindowContainerRef.current) ?? undefined}
                      isErrorMessageHidden
                      isHistorical={false}
                      isStringDate
                      label="Date de début de validité"
                      name="startOfValidityUtc"
                      style={{ width: 300 }}
                    />
                    <StyledFormikDatePicker
                      baseContainer={(isMainWindow ? ref.current : newWindowContainerRef.current) ?? undefined}
                      isErrorMessageHidden
                      isHistorical={false}
                      isStringDate
                      label="Date de fin de validité"
                      name="endOfValidityUtc"
                      style={{ width: 300 }}
                    />
                  </DatesWrapper>
                  <StyledFieldError>{errors.endOfValidityUtc}</StyledFieldError>
                </div>
                <StyledFormikTextarea $isRed label="Points d'attention" name="pointsOfAttention" rows={3} />
              </Column>
            </Columns>
            <FormikSharingOptions />
          </>
        )}
      </Formik>
    </div>
  )
}

const StyledFormikTextInput = styled(FormikTextInput)`
  margin-top: 16px;
`

const StyledFormikTextarea = styled(FormikTextarea)<{
  $isRed?: boolean
}>`
  label {
    ${p => p.$isRed && `color: ${p.theme.color.maximumRed};`}
  }

  textarea {
    ${p => p.$isRed && `background-color: ${p.theme.color.maximumRed15};`}

    &:active, &:hover, &:focus {
      ${p => p.$isRed && `background-color: ${p.theme.color.maximumRed15};`}
    }
  }
  margin-top: 16px;
`

const StyledFormikDatePicker = styled(FormikDatePicker)`
  margin-top: 64px;
  margin-bottom: 2px;
  text-align: left;
  > .Element-Fieldset__InnerBox {
    > div > span > div {
      width: 177px;
    }
  }
`

const Column = styled.div<{
  $width?: number
}>`
  margin-right: 24px;

  ${p => {
    if (p.$width) {
      return `width: ${p.$width}px`
    }

    return 'flex-grow: 1;'
  }}
`

const Columns = styled.div`
  display: flex;
`
const DatesWrapper = styled.div`
  display: flex;
`
const StyledFieldError = styled(FieldError)`
  text-align: left;
`
