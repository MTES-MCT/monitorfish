import { openAutoPriorNotificationForm } from '@features/PriorNotification/useCases/openAutoPriorNotificationForm'
import { openManualPriorNotificationForm } from '@features/PriorNotification/useCases/openManualPriorNotificationForm'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import { VesselIdentifier, type VesselIdentity } from 'domain/entities/vessel/types'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../../../auth/hooks/useIsSuperUser'
import { showVessel } from '../../../../../domain/use_cases/vessel/showVessel'
import { openPriorNotificationCard } from '../../../useCases/openPriorNotificationCard'

import type { PriorNotification } from '../../../PriorNotification.types'

type ActionButtonsCellProps = Readonly<{
  priorNotification: PriorNotification.PriorNotification
}>
export function ActionButtonsCell({ priorNotification }: ActionButtonsCellProps) {
  const isSuperUser = useIsSuperUser()
  const dispatch = useMainAppDispatch()

  const edit = () => {
    if (priorNotification.isManuallyCreated) {
      dispatch(
        openManualPriorNotificationForm(
          { operationDate: priorNotification.operationDate, reportId: priorNotification.id },
          priorNotification.fingerprint
        )
      )

      return
    }

    dispatch(
      openAutoPriorNotificationForm(
        { operationDate: priorNotification.operationDate, reportId: priorNotification.id },
        priorNotification.fingerprint
      )
    )
  }

  const open = () => {
    dispatch(
      openPriorNotificationCard(
        {
          operationDate: priorNotification.operationDate,
          reportId: priorNotification.id
        },
        priorNotification.fingerprint,
        priorNotification.isManuallyCreated
      )
    )
  }

  const selectMainMapVessel = () => {
    const vesselIdentity: VesselIdentity = {
      beaconNumber: null,
      districtCode: null,
      externalReferenceNumber: priorNotification.vesselExternalReferenceNumber ?? null,
      // TODO Check that.
      flagState: priorNotification.vesselFlagCountryCode ?? 'UNDEFINED',
      internalReferenceNumber: priorNotification.vesselInternalReferenceNumber ?? null,
      ircs: priorNotification.vesselIrcs ?? null,
      mmsi: priorNotification.vesselMmsi ?? null,
      vesselId: priorNotification.vesselId,
      vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
      vesselName: priorNotification.vesselName ?? null
    }

    dispatch(showVessel(vesselIdentity, false, true))
  }

  return (
    <Wrapper>
      <IconButton
        accent={Accent.TERTIARY}
        Icon={Icon.ViewOnMap}
        onClick={selectMainMapVessel}
        title="Centrer le navire sur la carte"
        withUnpropagatedClick
      />
      {isSuperUser && (
        <IconButton
          accent={Accent.TERTIARY}
          Icon={Icon.Edit}
          onClick={edit}
          title="Éditer le préavis"
          withUnpropagatedClick
        />
      )}
      {!isSuperUser && (
        <IconButton
          accent={Accent.TERTIARY}
          Icon={Icon.Display}
          onClick={open}
          title="Consulter le préavis"
          withUnpropagatedClick
        />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;

  > div > button {
    padding: 0px;
  }
`
