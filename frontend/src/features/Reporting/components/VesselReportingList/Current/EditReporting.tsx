import { WindowContext } from '@api/constants'
import { getVesselIdentityFromVessel } from '@features/Vessel/utils'
import { useGetVesselQuery } from '@features/Vessel/vesselApi'
import { Accent, Icon, IconButton, Size, THEME } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useMemo } from 'react'
import styled from 'styled-components'

import { ReportingForm } from '../../ReportingForm'

import type { Reporting } from '@features/Reporting/types'
import type { VesselIdentity } from 'domain/entities/vessel/types'

type EditReportingProps = Readonly<{
  closeForm: () => void
  editedReporting: Reporting.EditableReporting | undefined
  vesselIdOrIdentity: number | VesselIdentity
}>
export function EditReporting({ closeForm, editedReporting, vesselIdOrIdentity }: EditReportingProps) {
  const { data: vessel } = useGetVesselQuery(typeof vesselIdOrIdentity === 'number' ? vesselIdOrIdentity : skipToken)

  const vesselIdentity = useMemo(() => {
    switch (true) {
      case typeof vesselIdOrIdentity === 'number':
        return vessel ? getVesselIdentityFromVessel(vessel) : undefined

      case !vesselIdOrIdentity:
        return undefined

      default:
        return vesselIdOrIdentity
    }
  }, [vessel, vesselIdOrIdentity])

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
      {!vesselIdentity && <p>Chargement en cours...</p>}
      {vesselIdentity && (
        <StyledReportingForm
          closeForm={closeForm}
          editedReporting={editedReporting}
          hasWhiteBackground={false}
          vesselIdentity={vesselIdentity}
          windowContext={WindowContext.MainWindow}
        />
      )}
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
  margin-bottom: 16px;
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
