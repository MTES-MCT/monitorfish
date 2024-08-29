import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Icon, IconButton, Size, THEME } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import styled from 'styled-components'

import { ReportingForm } from '../../ReportingForm'

type EditReportingProps = {
  closeForm: () => void
}
export function EditReporting({ closeForm }: EditReportingProps) {
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  assertNotNullish(selectedVesselIdentity)
  const editedReporting = useMainAppSelector(state => state.reporting.editedReporting)

  return (
    <FormWrapper>
      <Header>
        <HeaderText>{editedReporting ? 'Editer' : 'Ouvrir'} un signalement</HeaderText>
        <CloseFormIcon
          accent={Accent.TERTIARY}
          color={THEME.color.slateGray}
          Icon={Icon.Close}
          onClick={closeForm}
          size={Size.SMALL}
          title="Fermer le formulaire"
        />
      </Header>
      <StyledReportingForm
        closeForm={closeForm}
        editedReporting={editedReporting}
        hasWhiteBackground={false}
        isFromSideWindow={false}
        selectedVesselIdentity={selectedVesselIdentity}
      />
    </FormWrapper>
  )
}

const StyledReportingForm = styled(ReportingForm)`
  padding-top: 16px;
  padding-bottom: 16px;
`

const CloseFormIcon = styled(IconButton)`
  margin-left: auto;
  margin-right: 8px;
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
