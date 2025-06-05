import { CNSP_SERVICE_OPTIONS, SHARING_OPTIONS } from '@features/VesselGroup/constants'
import { Sharing } from '@features/VesselGroup/types'
import { FormikMultiRadio, FormikMultiSelect } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'

export function FormikSharingOptions() {
  const isSuperUser = useIsSuperUser()
  const [field] = useField<string | undefined>('sharing')

  return (
    <Wrapper>
      {isSuperUser && (
        <FormikMultiRadio isInline isLabelHidden label="Partage du groupe" name="sharing" options={SHARING_OPTIONS} />
      )}
      {isSuperUser && field.value === Sharing.SHARED && (
        <StyledFormikMultiSelect
          label="Partager le groupe avec..."
          name="sharedTo"
          options={CNSP_SERVICE_OPTIONS}
          placeholder=""
          searchable={false}
        />
      )}
    </Wrapper>
  )
}

const StyledFormikMultiSelect = styled(FormikMultiSelect)`
  margin-top: 24px;
  text-align: left;
`

const Wrapper = styled.div`
  margin-top: 24px;
`
