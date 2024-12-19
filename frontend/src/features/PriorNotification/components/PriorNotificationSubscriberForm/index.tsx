import { BackOfficeBody } from '@features/BackOffice/components/BackofficeBody'
import { BackOfficeTitle } from '@features/BackOffice/components/BackOfficeTitle'
import {
  priorNotificationSubscriberApi,
  useGetPriorNotificationSubscriberQuery
} from '@features/PriorNotification/priorNotificationSubscriberApi'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { Accent, Button } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { ROUTER_PATHS } from 'paths'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { LoadingSpinnerWall } from 'ui/LoadingSpinnerWall'

import { AllPortSubscriptionsField } from './AllPortSubscriptionsField'
import { SegmentSubscriptionsField } from './SegmentSubscriptionsField'
import { getFormDataFromSubscriber } from './utils'
import { VesselSubscriptionsField } from './VesselSubscriptionsField'

import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'

export function PriorNotificationSubscriberForm() {
  const { controlUnitId } = useParams()
  assertNotNullish(controlUnitId)

  const dispatch = useBackofficeAppDispatch()
  const navigate = useNavigate()

  const { data: subscriber, isFetching } = useGetPriorNotificationSubscriberQuery(Number(controlUnitId))

  if (!subscriber) {
    return <LoadingSpinnerWall />
  }

  const formData = getFormDataFromSubscriber(subscriber)

  const goBackToList = () => {
    navigate(`${ROUTER_PATHS.backoffice}/${ROUTER_PATHS.priorNotificationSubscribers}`)
  }

  const update = (nextFormData: PriorNotificationSubscriber.FormData) => {
    dispatch(priorNotificationSubscriberApi.endpoints.updatePriorNotificationSubscriber.initiate(nextFormData)).unwrap()
  }

  const addPortSubscription = (newPortLocode: string) => {
    const nextPortLocodes = [...formData.portLocodes, newPortLocode]

    update({
      ...formData,
      portLocodes: nextPortLocodes
    })
  }

  const addSegmentSubscription = (newSegmentCode: string) => {
    const nextSegmentCodes = [...formData.fleetSegmentCodes, newSegmentCode]

    update({
      ...formData,
      fleetSegmentCodes: nextSegmentCodes
    })
  }

  const addVesselSubscription = (newVesselId: number) => {
    const nextVesselIds = [...formData.vesselIds, newVesselId]

    update({
      ...formData,
      vesselIds: nextVesselIds
    })
  }

  const disableFullPortSubscription = (portLocode: string) => {
    const nextPortLocodesWithAllNotifications = formData.portLocodesWithFullSubscription.filter(
      portLocodeWithFullSubscription => portLocodeWithFullSubscription !== portLocode
    )

    update({
      ...formData,
      portLocodesWithFullSubscription: nextPortLocodesWithAllNotifications
    })
  }

  const enableFullPortSubscription = (portLocode: string) => {
    const nextPortLocodesWithAllNotifications = [...formData.portLocodesWithFullSubscription, portLocode]

    update({
      ...formData,
      portLocodesWithFullSubscription: nextPortLocodesWithAllNotifications
    })
  }

  const removePortSubscription = (portLocodeToRemove: string) => {
    const nextPortLocodes = formData.portLocodes.filter(portLocode => portLocode !== portLocodeToRemove)
    const nextPortLocodesWithAllNotifications = formData.portLocodesWithFullSubscription.filter(
      portLocode => portLocode !== portLocodeToRemove
    )

    update({
      ...formData,
      portLocodes: nextPortLocodes,
      portLocodesWithFullSubscription: nextPortLocodesWithAllNotifications
    })
  }

  const removeSegementSubscription = (segmentCodeToRemove: string) => {
    const nextSegmentCodes = formData.fleetSegmentCodes.filter(segmentCode => segmentCode !== segmentCodeToRemove)

    update({
      ...formData,
      fleetSegmentCodes: nextSegmentCodes
    })
  }

  const removeVesselSubscription = (vesselIdToRemove: number) => {
    const nextVesselIds = formData.vesselIds.filter(vesselId => vesselId !== vesselIdToRemove)

    update({
      ...formData,
      vesselIds: nextVesselIds
    })
  }

  return (
    <Wrapper>
      <BackOfficeTitle>{`${subscriber.controlUnit.name} (${subscriber.controlUnit.administration.name}) – Paramétrage de la diffusion des préavis`}</BackOfficeTitle>

      <AllPortSubscriptionsField
        isDisabled={isFetching}
        onAdd={addPortSubscription}
        onFullSubscriptionCheck={enableFullPortSubscription}
        onFullSubscriptionUncheck={disableFullPortSubscription}
        onRemove={removePortSubscription}
        portSubscriptions={subscriber.portSubscriptions}
      />

      <hr />

      <SegmentSubscriptionsField
        fleetSegmentSubscriptions={subscriber.fleetSegmentSubscriptions}
        isDisabled={isFetching}
        onAdd={addSegmentSubscription}
        onRemove={removeSegementSubscription}
      />
      <VesselSubscriptionsField
        isDisabled={isFetching}
        onAdd={addVesselSubscription}
        onRemove={removeVesselSubscription}
        vesselSubscriptions={subscriber.vesselSubscriptions}
      />

      <hr />

      <div>
        <Button accent={Accent.SECONDARY} onClick={goBackToList}>
          Revenir à la liste
        </Button>
      </div>
    </Wrapper>
  )
}

const Wrapper = styled(BackOfficeBody)`
  > hr {
    margin: 40px 0;
  }

  .Table-SimpleTable {
    margin-bottom: 16px;
    width: 760px;

    td {
      vertical-align: middle;

      > .Element-IconButton {
        height: 20px;
        margin-top: 5px;
      }
    }
  }

  > .Field-Select {
    width: 760px;
  }
`
