import styled from 'styled-components'

import { Title } from '../commonStyles/Backoffice.style'
import ChevronIconSVG from '../icons/Chevron_simple_gris.svg?react'

type SectionTitleProps = Readonly<{
  dataCy?: string
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  title: string
}>
export function SectionTitle({ dataCy, isOpen, setIsOpen, title }: SectionTitleProps) {
  return (
    <Title data-cy={dataCy} onClick={() => setIsOpen(!isOpen)}>
      {title}
      <ChevronIcon $isOpen={isOpen} />
    </Title>
  )
}

const ChevronIcon = styled(ChevronIconSVG)<{
  $isOpen: boolean
}>`
  box-sizing: border-box;
  transform: ${p => (p.$isOpen ? 'rotate(0deg)' : 'rotate(180deg)')};
  transition: all 0.5s;
  margin-left: 15px;
  width: 14px;
  height: 7px;
`
