import React, { useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import FishingPeriod from './FishingPeriod'
import SectionTitle from '../SectionTitle'
import { Label } from '../../commonStyles/Input.style'

const FishingPeriodSection = (props) => {
  const {
    fishingPeriod,
    setFishingPeriod
  } = props

  const [show, setShow] = useState(false)

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
    <Other>
      <Label>Autres points sur la période</Label>
      <TextInput value={fishingPeriod?.otherInfo || ''}/>
    </Other>
  </>
}

const Other = styled.div`
  display: flex;
`

const TextInput = styled.input`
  height: 25px;
  width: 730px;
  border: 1px solid ${COLORS.lightGray};
`

export default FishingPeriodSection
