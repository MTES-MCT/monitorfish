import React from 'react'
import styled from 'styled-components'
import { ReactComponent as ChevronIconSVG } from '../icons/Chevron_simple_gris.svg'
import { Title } from '../commonStyles/Backoffice.style'

const SectionTitle = ({ title, isOpen, setIsOpen, dataCy }) => {
  return <Title onClick={() => setIsOpen(!isOpen)} data-cy={dataCy}>
     {title}
     <ChevronIcon $isOpen={isOpen}/>
  </Title>
}

const ChevronIcon = styled(ChevronIconSVG)`
  box-sizing: border-box;
  transform: ${props => props.$isOpen ? 'rotate(0deg)' : 'rotate(180deg)'};
  transition: all 0.5s;
  margin-left: 15px;
  width: 14px;
  height: 7px;
`

export default SectionTitle
