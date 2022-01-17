import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FishingPeriodForm from './FishingPeriodForm'
import SectionTitle from '../../SectionTitle'
import { Label, CustomInput } from '../../../commonStyles/Input.style'
import { setRegulationByKey } from '../../Regulation.slice'
import { Section, OtherRemark } from '../../../commonStyles/Backoffice.style'
import { REGULATORY_REFERENCE_KEYS } from '../../../../domain/entities/regulatory'

const FishingPeriodSection = () => {
  const { fishingPeriod } = useSelector(state => state.regulation.currentRegulation)

  const dispatch = useDispatch()

  const [show, setShow] = useState(false)
  const [isInputFilled, setIsInputFilled] = useState(false)

  const setOtherInfo = value => {
    dispatch(setRegulationByKey({
      key: REGULATORY_REFERENCE_KEYS.FISHING_PERIOD,
      value: {
        ...fishingPeriod,
        otherInfo: value
      }
    }))
  }

  const setFishingPeriod = value => {
    dispatch(setRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.FISHING_PERIOD, value }))
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
