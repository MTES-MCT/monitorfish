import React from 'react'
import { ContentLine, Label, CustomInput } from '../common_styles'
import InfoBox from '../InfoBox'
const RegulationZoneNameLine = props => {
  // const [isZoneNameInfoTextShown, setIsZoneNameInfoTextShown] = useState(false)
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
      isFormOpened={false}
      message={'zoneName'}
    />
  </ContentLine>
}

export default RegulationZoneNameLine
