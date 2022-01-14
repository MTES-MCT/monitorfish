import React, { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ContentLine, InfoText, InfoTextWrapper } from '../../../commonStyles/Backoffice.style'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import InfoBox from '../InfoBox'
import { INFO_TEXT } from '../../constants'
import { setRegulationByKey } from '../../Regulation.slice'

const RegulationLayerZoneLine = props => {
  const dispatch = useDispatch()
  const {
    nameZoneIsMissing
  } = props

  const { zone } = useSelector(state => state.regulation.currentRegulation)

  /* const [isInfoTextShown, setIsInfoTextShown] = useState(false) */
  const [isInputFilled, setIsInputFilled] = useState(false)

  useEffect(() => {
    setIsInputFilled(zone && zone !== '')
  }, [zone])

  const setZoneName = useCallback((value) => {
    dispatch(setRegulationByKey({ key: 'zone', value }))
  }, [setRegulationByKey, zone])

  return <ContentLine>
    <Label>Nom de la zone</Label>
    <CustomInput
      data-cy={`input-${zone}`}
      placeholder=''
      value={zone}
      onChange={setZoneName}
      width={'200px'}
      onMouseLeave={() => setIsInputFilled(zone && zone !== '')}
      $isGray={isInputFilled}
      $isRed={nameZoneIsMissing}
    />
    <InfoBox pointer>
      <InfoTextWrapper><InfoText>{INFO_TEXT.ZONE_NAME}</InfoText></InfoTextWrapper>
    </InfoBox>
  </ContentLine>
}

export default RegulationLayerZoneLine
