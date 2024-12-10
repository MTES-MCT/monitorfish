import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { TextInput } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { ContentLine, InfoText, InfoTextWrapper } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import { updateProcessingRegulationByKey } from '../../../Regulation/slice.backoffice'
import { REGULATORY_REFERENCE_KEYS } from '../../../Regulation/utils'
import { INFO_TEXT } from '../../constants'
import { InfoBox } from '../InfoBox'

export function RegulationLayerZoneLine() {
  const dispatch = useBackofficeAppDispatch()

  const zone = useBackofficeAppSelector(state => state.regulation.processingRegulation?.zone)

  const setZoneName = value => {
    dispatch(updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.ZONE, value }))
  }

  return (
    <ContentLine>
      <Label>Nom de la zone</Label>
      <StyledTextInput
        data-cy={`input-${zone}`}
        error={zone ? undefined : 'Zone requise.'}
        isErrorMessageHidden
        isLabelHidden
        label="Nom de la zone"
        name="Nom de la zone"
        onChange={setZoneName}
        placeholder="Nom de la zone"
        value={zone}
        width="200px"
      />
      <InfoBox pointer>
        <InfoTextWrapper>
          <InfoText>{INFO_TEXT.ZONE_NAME}</InfoText>
        </InfoTextWrapper>
      </InfoBox>
    </ContentLine>
  )
}

const StyledTextInput = styled(TextInput)`
  margin-right: 8px;
`
