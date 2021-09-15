import React, { useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'
import { Title } from '../commonStyles/Backoffice.style'

const SectionTitle = ({ title }) => {
  const [isOpen, setIsOpen] = useState(false)

  return <Title onClick={() => setIsOpen(!isOpen)}>
     {title}
     <ChevronIcon isOpen={isOpen}/>
  </Title>
}

const ChevronIcon = styled(ChevronIconSVG)`
  transform: ${props => props.isOpen ? 'rotate(0deg)' : 'rotate(180deg)'};
  transition: all 0.5s;
  width: 14px;
  height: 7px;
`

export default SectionTitle
