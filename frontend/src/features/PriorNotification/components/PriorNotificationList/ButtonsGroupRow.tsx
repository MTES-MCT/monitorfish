import { priorNotificationActions } from '@features/PriorNotification/slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import { VesselIdentifier, type VesselIdentity } from 'domain/entities/vessel/types'
import styled from 'styled-components'

import { showVessel } from '../../../../domain/use_cases/vessel/showVessel'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

type ButtonsGroupRowProps = Readonly<{
  priorNotification: PriorNotification.PriorNotification
}>
export function ButtonsGroupRow({ priorNotification }: ButtonsGroupRowProps) {
  const dispatch = useMainAppDispatch()

  const openPriorNotificationDetail = () => {
    dispatch(priorNotificationActions.openPriorNotificationDetail(priorNotification.id))
  }

  const selectMainMapVessel = () => {
    const vesselIdentity: VesselIdentity = {
      beaconNumber: null,
      districtCode: null,
      externalReferenceNumber: priorNotification.vesselExternalReferenceNumber ?? null,
      // TODO Check that.
      flagState: priorNotification.vesselFlagCountryCode ?? 'X',
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
    <ButtonsGroup>
      <IconButton accent={Accent.TERTIARY} Icon={Icon.ViewOnMap} onClick={selectMainMapVessel} />
      <IconButton accent={Accent.TERTIARY} Icon={Icon.Display} onClick={openPriorNotificationDetail} />
    </ButtonsGroup>
  )
}

const ButtonsGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-top: 2px;
  position: relative;

  > button {
    padding: 0px;
  }
`
