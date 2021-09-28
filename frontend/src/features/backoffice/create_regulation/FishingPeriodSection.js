import React from 'react'
import FishingPeriod from './FishingPeriod'
import SectionTitle from '../SectionTitle'
import { Label } from '../../commonStyles/Input.style'

const FishingPeriodSection = (props) => {
  const {
    fishingPeriod,
    setFishingPeriod
  } = props

  return <>
    <SectionTitle title={'Périodes de pêche'}/>
    <FishingPeriod
      fishingPeriod={fishingPeriod}
      setFishingPeriod={setFishingPeriod}
    />
    <Label>Autres points sur la période</Label>
  </>
}

export default FishingPeriodSection
