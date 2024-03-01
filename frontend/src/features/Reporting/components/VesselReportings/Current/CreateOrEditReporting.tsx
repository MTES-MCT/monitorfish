import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Icon, Size, THEME, usePrevious, IconButton } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { vesselsAreEquals } from '../../../../../domain/entities/vessel/vessel'
import { setEditedReporting } from '../../../slice'
import { ReportingForm } from '../../ReportingForm'

export function CreateOrEditReporting() {
  const dispatch = useMainAppDispatch()
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const editedReporting = useMainAppSelector(state => state.reporting.editedReporting)
  const [newReportingFormIsOpen, setNewReportingFormIsOpen] = useState(false)
  const previousSelectedVesselIdentity = usePrevious(selectedVesselIdentity)

  const close = useCallback(() => {
    setNewReportingFormIsOpen(false)
    dispatch(setEditedReporting(null))
  }, [dispatch])

  useEffect(() => {
    if (!vesselsAreEquals(previousSelectedVesselIdentity, selectedVesselIdentity)) {
      close()
    }
  }, [selectedVesselIdentity, previousSelectedVesselIdentity, close])

  return newReportingFormIsOpen || editedReporting ? (
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
    <NewReportingButton
      accent={Accent.PRIMARY}
      data-cy="vessel-sidebar-open-reporting"
      onClick={() => setNewReportingFormIsOpen(true)}
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
