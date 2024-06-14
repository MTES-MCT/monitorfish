import { openPriorNotificationForm } from '@features/PriorNotification/useCases/openPriorNotificationForm'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import { VesselIdentifier, type VesselIdentity } from 'domain/entities/vessel/types'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { showVessel } from '../../../../domain/use_cases/vessel/showVessel'
import { openPriorNotificationCard } from '../../useCases/openPriorNotificationCard'

import type { PriorNotification } from '../../PriorNotification.types'

type ButtonsGroupRowProps = Readonly<{
  priorNotification: PriorNotification.PriorNotification
}>
export function ButtonsGroupRow({ priorNotification }: ButtonsGroupRowProps) {
  const isSuperUser = useIsSuperUser()
  const dispatch = useMainAppDispatch()

  const editPriorNotification = (reportId: string, fingerprint: string) => {
    dispatch(openPriorNotificationForm(reportId, fingerprint))
  }

  const openPriorNotificationDetail = () => {
    dispatch(openPriorNotificationCard(priorNotification.id, priorNotification.fingerprint))
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
      {isSuperUser && priorNotification.isManuallyCreated && (
        <IconButton
          accent={Accent.TERTIARY}
          Icon={Icon.Edit}
          onClick={() => editPriorNotification(priorNotification.id, priorNotification.fingerprint)}
          title="Éditer le préavis"
          withUnpropagatedClick
        />
      )}
      {!isSuperUser && priorNotification.isManuallyCreated && (
        <IconButton
          accent={Accent.TERTIARY}
          Icon={Icon.Display}
          onClick={openPriorNotificationDetail}
          title="Consulter le préavis"
          withUnpropagatedClick
        />
      )}
      {!priorNotification.isManuallyCreated && (
        <IconButton
          accent={Accent.TERTIARY}
          Icon={Icon.Display}
          onClick={openPriorNotificationDetail}
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

  > button {
    padding: 0px;
  }
`
