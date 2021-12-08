import React from 'react'
import styled from 'styled-components'

import SideWindowMenu from './SideWindowMenu'
import Alerts from './alerts/Alerts'

const SideWindow = () => {
  return <Wrapper>
    <SideWindowMenu/>
    <Alerts/>
  </Wrapper>
}

const Wrapper = styled.div`
  display: flex;
`

export default SideWindow
