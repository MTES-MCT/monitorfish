import React, { useState } from 'react'
import styled from 'styled-components'
import FishingPeriodForm from './FishingPeriodForm'
import SectionTitle from '../../SectionTitle'
import { Label, CustomInput } from '../../../commonStyles/Input.style'

const FishingPeriodSection = (props) => {
  const {
    fishingPeriod,
    setFishingPeriod
  } = props

  const [show, setShow] = useState(false)
  const [isInputFilled, setIsInputFilled] = useState(false)

  const setOtherInfo = value => {
    setFishingPeriod({
      ...fishingPeriod,
      otherInfo: value
    })
  }

  return <>
    <SectionTitle
      title={'Périodes de pêche'}
      isOpen={show}
      setIsOpen={setShow}
    />
    <FishingPeriodForm
      show={show}
      fishingPeriod={fishingPeriod}
      setFishingPeriod={setFishingPeriod}
    />
    <OtherRemark show={show}>
      <Label>Autres points sur la période</Label>
      <CustomInput
        width={'730px'}
        value={fishingPeriod?.otherInfo || ''}
        onChange={setOtherInfo}
        onMouseLeave={() => setIsInputFilled(fishingPeriod.otherInfo && fishingPeriod.otherInfo !== '')}
        $isGray={isInputFilled} />
    </OtherRemark>
  </>
}

const OtherRemark = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  margin-top: 10px;
`

export default FishingPeriodSection
