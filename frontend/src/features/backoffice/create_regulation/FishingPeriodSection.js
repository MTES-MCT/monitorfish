import React from 'react'
import FishingPeriod from './FishingPeriod'

const FishingPeriodSection = (props) => {
  const {
    fishingPeriod,
    setFishingPeriod
  } = props

  return <FishingPeriod
  fishingPeriod={fishingPeriod}
  setFishingPeriod={setFishingPeriod}
  />
}

export default FishingPeriodSection
