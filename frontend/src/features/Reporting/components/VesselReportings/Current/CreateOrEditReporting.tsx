import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Icon, IconButton, Size, THEME } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { setEditedReporting } from '../../../slice'
import { ReportingForm } from '../../ReportingForm'

export function CreateOrEditReporting() {
  const dispatch = useMainAppDispatch()
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  assertNotNullish(selectedVesselIdentity)
  const [isNewReportingFormOpen, setIsNewReportingFormOpen] = useState(false)
  const editedReporting = useMainAppSelector(state => state.reporting.editedReporting)

  const close = useCallback(() => {
    setIsNewReportingFormOpen(false)
    dispatch(setEditedReporting(null))
  }, [dispatch])

  return isNewReportingFormOpen || editedReporting ? (
    <FormWrapper>
      <Header>
        <HeaderText>{editedReporting ? 'Editer' : 'Ouvrir'} un signalement</HeaderText>
        <CloseFormIcon
          accent={Accent.TERTIARY}
          color={THEME.color.slateGray}
          Icon={Icon.Close}
          onClick={close}
          size={Size.SMALL}
          title="Fermer le formulaire"
        />
      </Header>
      <ReportingForm
        closeForm={close}
        editedReporting={editedReporting}
        hasWhiteBackground={false}
        isFromSideWindow={false}
        selectedVesselIdentity={selectedVesselIdentity}
      />
    </FormWrapper>
  ) : (
    <NewReportingButton
      accent={Accent.PRIMARY}
      data-cy="vessel-sidebar-open-reporting"
      onClick={() => setIsNewReportingFormOpen(true)}
    >
      Ouvrir un signalement
    </NewReportingButton>
  )
}

const CloseFormIcon = styled(IconButton)`
  margin-left: auto;
  margin-right: 8px;
`

const NewReportingButton = styled(Button)`
  margin: 0px 10px 10px 0px;
`

const FormWrapper = styled.div`
  margin-bottom: 10px;
  width: 448px;
  display: inline-block;
  background: ${THEME.color.gainsboro} 0% 0% no-repeat padding-box;
  color: ${THEME.color.slateGray};
`

const Header = styled.div`
  border-bottom: 2px solid ${THEME.color.white};
  display: flex;
  height: 32px;
`

const HeaderText = styled.span`
  margin: 7px 15px;
  font: normal normal medium 13px/18px Marianne;
`
