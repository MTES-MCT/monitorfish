import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { REGULATORY_REFERENCE_KEYS } from '../../../../domain/entities/regulatory'
import { ContentLine, InfoText, InfoTextWrapper } from '../../../commonStyles/Backoffice.style'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import { INFO_TEXT } from '../../constants'
import { updateProcessingRegulationByKey } from '../../Regulation.slice'
import InfoBox from '../InfoBox'

function RegulationLayerZoneLine(props) {
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
        $isGray={zone && zone !== ''}
        $isRed={nameZoneIsMissing}
        data-cy={`input-${zone}`}
        onChange={setZoneName}
        placeholder=""
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

export default RegulationLayerZoneLine
