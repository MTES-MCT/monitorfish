import styled from 'styled-components'

import { ReactComponent as EditSVG } from '../../icons/Bouton_edition.svg'

export const EditIcon = styled(EditSVG)<{
  $isOver: boolean
}>`
  display: ${p => (p.$isOver ? 'flex' : 'none')};
  width: ${p => (p.width ? p.width : '16px')};
  flex-shrink: 0;
  align-self: center;
  margin-right: 7px;
`
