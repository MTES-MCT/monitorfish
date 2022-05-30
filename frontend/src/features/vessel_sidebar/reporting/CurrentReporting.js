import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import Reporting from './Reporting'
import { COLORS } from '../../../constants/constants'
import { PrimaryButton } from '../../commonStyles/Buttons.style'

const CurrentReporting = () => {
  const {
    /** @type {Reporting} */
    currentAndArchivedReporting,
    /** @type {Reporting || null} */
    nextCurrentAndHistoryReporting
  } = useSelector(state => state.reporting)

  console.log(currentAndArchivedReporting, nextCurrentAndHistoryReporting)

  return <Wrapper>
    <OpenReporting>Ouvrir un signalement</OpenReporting>
    {
      currentAndArchivedReporting?.current?.map(reporting => {
        return <Reporting
          key={reporting.id}
          reporting={reporting}
        />
      })
    }
  </Wrapper>
}

const Wrapper = styled.div`
  background: ${COLORS.white};
  margin-top: 10px;
  padding: 10px 20px;
  text-align: left;
`

const OpenReporting = styled(PrimaryButton)`
  margin: 0px 0px 10px 0px;
`

export default CurrentReporting
