import React, { useState } from 'react'
import styled from 'styled-components'
import FishingPeriod from './FishingPeriod'
import SectionTitle from '../SectionTitle'
import { Label, CustomInput } from '../../commonStyles/Input.style'

const FishingPeriodSection = (props) => {
  const {
    fishingPeriod,
    setFishingPeriod
  } = props

  const [show, setShow] = useState(false)

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
    <FishingPeriod
      show={show}
      fishingPeriod={fishingPeriod}
      setFishingPeriod={setFishingPeriod}
    />
    <Other show={show}>
      <Label>Autres points sur la période</Label>
      <CustomInput
        width={'730px'}
        value={fishingPeriod?.otherInfo || ''}
        onChange={setOtherInfo} />
    </Other>
  </>
}

const Other = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  margin-top: 30px;
`

export default FishingPeriodSection
