import React, { useState } from 'react'
import styled from 'styled-components'
import NewWindow from 'react-new-window'

import AlertsWindowFirstMenu from './AlertsWindowFirstMenu'
import AlertsWindowSecondMenu from './AlertsWindowSecondMenu'
import AlertsWindowBody from './AlertsWindowBody'

export const MenuSeaFronts = {
  MEMN: 'MEMN',
  NAMOSA: 'NAMO / SA',
  MED: 'MED',
  OUTREMEROA: 'OUTRE-MER OA',
  OUTREMEROI: 'OUTRE-MER OI'
}

const AlertsWindow = ({ baseUrl, isOpen, setIsOpen }) => {
  const [selectedSeaFront, setSelectedSeaFront] = useState(MenuSeaFronts.MEMN)

  return isOpen
    ? <NewWindow
    name={'Alertes'}
    title={'Alertes'}
    features={{ width: '1200px', height: '900px' }}
    onUnload={() => setIsOpen(false)}
  >
      <Wrapper>
        <AlertsWindowFirstMenu/>
        <AlertsWindowSecondMenu
          selectedSeaFront={selectedSeaFront}
          setSelectedSeaFront={setSelectedSeaFront}
        />
      <AlertsWindowBody
        selectedSeaFront={selectedSeaFront}
        baseUrl={baseUrl}
      />
      </Wrapper>
  </NewWindow>
    : null
}

const Wrapper = styled.div`
  display: flex;
`

export default AlertsWindow
