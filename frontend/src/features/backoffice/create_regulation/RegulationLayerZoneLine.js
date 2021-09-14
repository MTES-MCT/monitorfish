import React, { useState } from 'react'
import { ContentLine } from '../../commonStyles/Backoffice.style'
import { Label, CustomInput } from '../../commonStyles/Input.style'
import InfoBox from './InfoBox'
const RegulationLayerZoneLine = props => {
  const [isInfoTextShown, setIsInfoTextShown] = useState(false)
  const [isInputFilled, setIsInputFilled] = useState(false)
  const {
    nameZone,
    setNameZone
  } = props

  const onChange = value => {
    setNameZone(value)
    setIsInputFilled(value && value !== '')
  }
  return <ContentLine>
    <Label>Nom de la zone</Label>
    <CustomInput
      placeholder=''
      value={nameZone}
      onChange={value => onChange(value)}
      width={'200px'}
      onMouseLeave={() => setIsInputFilled(nameZone && nameZone !== '')}
      isGray={isInputFilled}
    />
    <InfoBox
      isInfoTextShown={isInfoTextShown}
      setIsInfoTextShown={setIsInfoTextShown}
      isFormOpened={false}
      message={'zoneName'}
    />
  </ContentLine>
}

export default RegulationLayerZoneLine
