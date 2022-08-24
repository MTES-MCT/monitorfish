import React from 'react'

import Haul from './Haul'

function FARMessage({ message }) {
  const { hauls } = message

  return (
    <>
      {hauls.map((haul, index) => (
        <Haul key={index} hasManyHauls={hauls?.length > 1} haul={haul} haulNumber={index + 1} />
      ))}
    </>
  )
}

export default FARMessage
