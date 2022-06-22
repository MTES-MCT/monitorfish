import React, { useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { ReactComponent as CloseIconSVG } from '../../../icons/Croix_grise.svg'
import NewReportingForm from './NewReportingForm'
import { PrimaryButton } from '../../../commonStyles/Buttons.style'
import { useSelector } from 'react-redux'

const NewReporting = () => {
  const selectedVesselIdentity = useSelector(state => state.vessel.selectedVesselIdentity)
  const [newReportingFormIsOpen, setNewReportingFormIsOpen] = useState(false)

  return <>
    {
      newReportingFormIsOpen
        ? <FormWrapper>
          <Header>
            <HeaderText>
              Ouvrir un signalement
            </HeaderText>
            <CloseIcon
              onClick={() => setNewReportingFormIsOpen(false)}
            />
          </Header>
          <NewReportingForm
            selectedVesselIdentity={selectedVesselIdentity}
            closeForm={() => setNewReportingFormIsOpen(false)}
          />
        </FormWrapper>
        : <NewReportingButton
          data-cy={'vessel-sidebar-open-reporting'}
          onClick={() => setNewReportingFormIsOpen(true)}
        >
          Ouvrir un signalement
        </NewReportingButton>
    }
  </>
}

const NewReportingButton = styled(PrimaryButton)`
  margin: 0px 10px 10px 0px;
`

const FormWrapper = styled.div`
  margin-bottom: 10px;
  background: ${COLORS.cultured} 0% 0% no-repeat padding-box;
  border: 1px solid ${COLORS.lightGray};
  color: ${COLORS.slateGray};
`

const Header = styled.div`
  border-bottom: 1px solid ${COLORS.lightGray};
  display: flex;
  height: 32px;
`

const HeaderText = styled.span`
  margin: 7px 15px;
  font: normal normal medium 13px/18px Marianne;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  vertical-align: text-bottom;
  cursor: pointer;
  height: 30px;
  margin: 2px 10px 0 auto;
`

export default NewReporting
