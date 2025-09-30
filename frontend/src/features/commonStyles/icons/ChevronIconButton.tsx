import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type ChevronProps = {
  accent?: Accent
  className?: string
  isOpen: boolean
  onClick: () => void
}

export function ChevronIconButton({ accent = Accent.PRIMARY, className = '', isOpen, onClick }: ChevronProps) {
  return (
    <StyledChevronButton
      $isOpen={isOpen}
      accent={accent}
      className={className}
      Icon={Icon.Chevron}
      onClick={onClick}
      title={isOpen ? 'Fermer' : 'Ouvrir'}
    />
  )
}

export const StyledChevronButton = styled(IconButton)<{ $isOpen: boolean }>`
  width: 16px;
  height: 16px;
  //margin-top: 3px;
  //margin-right: 8px;
  //margin-left: auto;
  padding: 16px;

  transform: ${props => (!props.$isOpen ? 'rotate(0deg)' : 'rotate(-180deg)')};
  transition: all 0.5s;
  background: transparent;
  border: 1px solid transparent;

  &:hover {
    background: transparent;
    border: 1px solid transparent;
  }
`

export const StyledChevronIcon = styled(Icon.Chevron)<ChevronProps>`
  width: 16px;
  height: 16px;
  transform: ${props => (!props.isOpen ? 'rotate(0deg)' : 'rotate(-180deg)')};
  transition: all 0.5s;
  margin-left: auto;
`
