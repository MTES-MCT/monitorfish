import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'

const NotImplementedMessage = () => {
  return <Zone>
    <Message>L&apos;affichage de ce type de message n&apos;est pas encore supporté.</Message>
  </Zone>
}

const Zone = styled.div`
  padding: 5px 10px 0px 10px;
  margin-top: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.background};
`
const Message = styled.div`
  padding: 5px;
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
  margin-top: 5px;
  margin-bottom: 5px;
  color: ${COLORS.slateGray} ;
`
export default NotImplementedMessage
