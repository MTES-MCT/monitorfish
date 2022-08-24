import React from 'react'
import styled from 'styled-components'

import { Title } from '../commonStyles/Backoffice.style'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'

function SectionTitle({ dataCy, isOpen, setIsOpen, title }) {
  return (
    <Title data-cy={dataCy} onClick={() => setIsOpen(!isOpen)}>
      {title}
      <ChevronIcon $isOpen={isOpen} />
    </Title>
  )
}

const ChevronIcon = styled(ChevronIconSVG)`
  box-sizing: border-box;
  transform: ${props => (props.$isOpen ? 'rotate(0deg)' : 'rotate(180deg)')};
  transition: all 0.5s;
  margin-left: 15px;
  width: 14px;
  height: 7px;
`

export default SectionTitle
