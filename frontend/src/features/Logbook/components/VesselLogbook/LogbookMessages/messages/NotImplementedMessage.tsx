import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export function NotImplementedMessage() {
  return (
    <Zone>
      <Message>L&apos;affichage de ce type de message n&apos;est pas encore supporté.</Message>
    </Zone>
  )
}

const Zone = styled.div`
  background: ${THEME.color.white};
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  padding: 5px 10px 0px 10px;
  text-align: left;
`

const Message = styled.div`
  color: ${THEME.color.slateGray};
  display: table;
  margin: 5px 0;
  min-width: 40%;
  padding: 5px;
  width: inherit;
`
