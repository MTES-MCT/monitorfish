import styled from 'styled-components'
import { ReactComponent as EditSVG } from '../../icons/Bouton_edition.svg'

export const EditIcon = styled(EditSVG)`
  display: ${props => props.$isOver ? 'flex' : 'none'};
  width: ${props => props.width ? props.width : '16px'};
  flex-shrink: 0;
  align-self: center;
  margin-right: 7px;
`
