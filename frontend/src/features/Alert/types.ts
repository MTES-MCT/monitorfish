import { PendingAlertValueSchema, SilencedAlertSchema } from '@features/Alert/schemas/SilencedAlertSchema'
import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import z from 'zod'

import type { MissionAction } from '@features/Mission/missionAction.types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { Except } from 'type-fest'

export type PendingAlert = {
  creationDate: string
  externalReferenceNumber: string
  flagState: string
  id: number
  infraction: MissionAction.Infraction | null
  internalReferenceNumber: string
  ircs: string
  tripNumber: string
  value: PendingAlertValue
  vesselIdentifier: VesselIdentifier
  vesselName: string
}

export type PendingAlertValue = z.infer<typeof PendingAlertValueSchema>

// eslint-disable-next-line @typescript-eslint/naming-convention
export type LEGACY_PendingAlert = PendingAlert & {
  isValidated: boolean
}

export type SilencedAlert = z.infer<typeof SilencedAlertSchema>

export type SilencedAlertData = Except<SilencedAlert, 'id' | 'isReactivated'>

export type SilencedAlertPeriodRequest = {
  beforeDateTime: Date | null
  silencedAlertPeriod: string | null
}

export type SilenceAlertQueueItem = {
  pendingAlertId: number
  silencedAlertPeriodRequest: SilencedAlertPeriodRequest
}

export type AlertNameAndVesselIdentity = Vessel.VesselIdentity & {
  name: string | null | undefined
}
