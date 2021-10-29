import React, { useEffect, useState } from 'react'
import { ContentLine } from '../../commonStyles/Backoffice.style'
import { Label, CustomInput } from '../../commonStyles/Input.style'
import InfoBox from './InfoBox'
const RegulationLayerZoneLine = props => {
  const {
    nameZone,
    setNameZone,
    nameZoneIsMissing
  } = props

  const [isInfoTextShown, setIsInfoTextShown] = useState(false)
  const [isInputFilled, setIsInputFilled] = useState(false)

  useEffect(() => {
    setIsInputFilled(nameZone && nameZone !== '')
  }, [nameZone])

  return <ContentLine>
    <Label>Nom de la zone</Label>
    <CustomInput
      data-cy={`input-${nameZone}`}
      placeholder=''
      value={nameZone}
      onChange={value => setNameZone(value)}
      width={'200px'}
      onMouseLeave={() => setIsInputFilled(nameZone && nameZone !== '')}
      $isGray={isInputFilled}
      $isRed={nameZoneIsMissing}
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
