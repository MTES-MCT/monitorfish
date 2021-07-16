import React, { useState } from 'react'
import { ContentLine, Label, CustomInput } from '../common_styles'
import InfoBox from '../InfoBox'
const RegulationZoneNameLine = props => {
  const [isInfoTextShown, setIsInfoTextShown] = useState(false)
  const {
    nameZone,
    setNameZone
  } = props
  return <ContentLine>
    <Label>Nom de la zone</Label>
    <CustomInput
      placeholder=''
      value={nameZone}
      onChange={setNameZone}
      width={'180px'}
    />
    <InfoBox
      isInfoTextShown={isInfoTextShown}
      setIsInfoTextShown={setIsInfoTextShown}
      isFormOpened={false}
      message={'zoneName'}
    />
  </ContentLine>
}

export default RegulationZoneNameLine
