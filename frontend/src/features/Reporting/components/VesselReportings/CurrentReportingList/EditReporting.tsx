import { WindowContext } from '@api/constants'
import { Accent, Icon, IconButton, Size, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { ReportingForm } from '../../ReportingForm'
import { Loader as ReportingFormLoader } from '../../ReportingForm/Loader'

import type { Reporting } from '@features/Reporting/types'
import type { Vessel } from '@features/Vessel/Vessel.types'

type EditReportingProps = Readonly<{
  editedReporting: Reporting.EditableReporting | undefined
  onClose: () => void
  onIsDirty: ((isDirty: boolean) => void) | undefined
  vesselIdentity: Vessel.VesselIdentity
}>
export function EditReporting({ editedReporting, onClose, onIsDirty, vesselIdentity }: EditReportingProps) {
  return (
    <FormWrapper>
      <Header>
        <HeaderText>{editedReporting ? 'Editer' : 'Ouvrir'} un signalement</HeaderText>
        <CloseFormIcon
          accent={Accent.TERTIARY}
          color={THEME.color.slateGray}
          Icon={Icon.Close}
          onClick={onClose}
          size={Size.SMALL}
          title="Fermer le formulaire"
        />
      </Header>

      {!vesselIdentity && <ReportingFormLoader />}
      {vesselIdentity && (
        <StyledReportingForm
          editedReporting={editedReporting}
          onClose={onClose}
          onIsDirty={onIsDirty}
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
