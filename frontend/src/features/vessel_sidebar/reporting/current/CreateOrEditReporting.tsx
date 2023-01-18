import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { ReportingForm } from './ReportingForm'
import { COLORS } from '../../../../constants/constants'
import { setEditedReporting } from '../../../../domain/shared_slices/Reporting'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { PrimaryButton } from '../../../commonStyles/Buttons.style'
import { ReactComponent as CloseIconSVG } from '../../../icons/Croix_grise.svg'

export function CreateOrEditReporting() {
  const dispatch = useAppDispatch()
  const { selectedVesselIdentity } = useAppSelector(state => state.vessel)
  const editedReporting = useAppSelector(state => state.reporting.editedReporting)
  const [newReportingFormIsOpen, setNewReportingFormIsOpen] = useState(false)

  const close = useCallback(() => {
    setNewReportingFormIsOpen(false)
    dispatch(setEditedReporting(null))
  }, [dispatch])

  return newReportingFormIsOpen || editedReporting ? (
    <FormWrapper>
      <Header>
        <HeaderText>{editedReporting ? 'Editer' : 'Ouvrir'} un signalement</HeaderText>
        <CloseIcon onClick={close} />
      </Header>
      {selectedVesselIdentity && (
        <ReportingForm
          closeForm={close}
          editedReporting={editedReporting}
          fromSideWindow={false}
          hasWhiteBackground={false}
          selectedVesselIdentity={selectedVesselIdentity}
        />
      )}
    </FormWrapper>
  ) : (
    <NewReportingButton data-cy="vessel-sidebar-open-reporting" onClick={() => setNewReportingFormIsOpen(true)}>
      Ouvrir un signalement
    </NewReportingButton>
  )
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
