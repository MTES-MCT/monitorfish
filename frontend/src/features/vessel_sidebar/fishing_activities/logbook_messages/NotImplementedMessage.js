import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import countries from 'i18n-iso-countries'

countries.registerLocale(require('i18n-iso-countries/langs/fr.json'))

const NotImplementedMessage = props => {
  return <>
    <Zone>L affichage de ce type de message n est pas pris en compte.</Zone>
  </>
}

const Zone = styled.div`
  padding: 5px 10px 0px 10px;
  margin-top: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.background};
`
export default NotImplementedMessage
