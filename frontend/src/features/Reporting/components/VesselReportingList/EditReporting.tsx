import { WindowContext } from '@api/constants'
import { Accent, Icon, IconButton, Size, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { ReportingForm } from '../ReportingForm'
import { Loader as ReportingFormLoader } from '../ReportingForm/Loader'

import type { Reporting } from '@features/Reporting/types'
import type { VesselIdentity } from 'domain/entities/vessel/types'

type EditReportingProps = Readonly<{
  closeForm: () => void
  editedReporting: Reporting.EditableReporting | undefined
  vesselIdentity: VesselIdentity
}>
export function EditReporting({ closeForm, editedReporting, vesselIdentity }: EditReportingProps) {
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

      {!vesselIdentity && <ReportingFormLoader />}
      {vesselIdentity && (
        <StyledReportingForm
          closeForm={closeForm}
          editedReporting={editedReporting}
          vesselIdentity={vesselIdentity}
          windowContext={WindowContext.MainWindow}
        />
      )}
    </FormWrapper>
  )
}

const StyledReportingForm = styled(ReportingForm)`
  padding-bottom: 16px;
  padding-top: 16px;
`

const CloseFormIcon = styled(IconButton)`
  margin-left: auto;
  margin-right: 8px;
`

const FormWrapper = styled.div`
  background: ${p => p.theme.color.gainsboro} 0% 0% no-repeat padding-box;
  color: ${p => p.theme.color.slateGray};
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`

const Header = styled.div`
  border-bottom: 2px solid ${p => p.theme.color.white};
  display: flex;
  height: 32px;
`

const HeaderText = styled.span`
  font: normal normal medium 13px/18px Marianne;
  margin: 7px 15px;
`
