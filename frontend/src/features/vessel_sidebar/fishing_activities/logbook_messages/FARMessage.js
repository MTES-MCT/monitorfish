import React from 'react'
import Haul from './Haul'
import { v4 as uuidv4 } from 'uuid'

const FARMessage = ({ message }) => {
  const { hauls } = message
  return <>
    {
        hauls.map((haul, index) =>
        <Haul
            key={uuidv4()}
            haulNumber={index + 1}
            hasManyHauls={hauls?.length > 1}
            haul={haul}

        />)
    }
  </>
}

export default FARMessage
