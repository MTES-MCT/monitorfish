import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ContentLine, InfoText, InfoTextWrapper } from '../../../commonStyles/Backoffice.style'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import InfoBox from '../InfoBox'
import { INFO_TEXT } from '../../constants'
import { updateProcessingRegulationByKey } from '../../slice'
import { REGULATORY_REFERENCE_KEYS } from '../../../Regulation/utils'

const RegulationLayerZoneLine = props => {
  const dispatch = useDispatch()
  const { nameZoneIsMissing } = props

  const { zone } = useSelector(state => state.regulation.processingRegulation)

  const setZoneName = value => {
    dispatch(updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.ZONE, value }))
  }

  return (
    <ContentLine>
      <Label>Nom de la zone</Label>
      <CustomInput
        data-cy={`input-${zone}`}
        placeholder=""
        value={zone}
        onChange={setZoneName}
        width={'200px'}
        $isGray={zone && zone !== ''}
        $isRed={nameZoneIsMissing}
      />
      <InfoBox pointer>
        <InfoTextWrapper>
          <InfoText>{INFO_TEXT.ZONE_NAME}</InfoText>
        </InfoTextWrapper>
      </InfoBox>
    </ContentLine>
  )
}

export default RegulationLayerZoneLine
