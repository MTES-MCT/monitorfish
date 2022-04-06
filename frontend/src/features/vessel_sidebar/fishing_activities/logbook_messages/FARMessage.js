import React from 'react'
import Haul from './Haul'

const FARMessage = ({ message }) => {
  const { hauls } = message
  return <>
    {
        hauls.map((haul, index) =>
        <Haul
            key={index}
            haulNumber={index + 1}
            hasManyHauls={hauls?.length > 1}
            haul={haul}

        />)
    }
  </>
}

export default FARMessage
