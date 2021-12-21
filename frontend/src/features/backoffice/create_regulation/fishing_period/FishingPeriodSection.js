import React, { useState } from 'react'
import FishingPeriodForm from './FishingPeriodForm'
import SectionTitle from '../../SectionTitle'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import { Section, OtherRemark } from '../../../commonStyles/Backoffice.style'

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

  return <Section show>
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
  </Section>
}

export default FishingPeriodSection
