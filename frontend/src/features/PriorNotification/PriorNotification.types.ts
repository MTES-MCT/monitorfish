// import type { SeaFrontGroup } from '../../domain/entities/seaFront/constants'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'
import type { UndefineExcept } from '@mtes-mct/monitor-ui'
import type { SeaFront } from 'domain/entities/seaFront/constants'

export namespace PriorNotification {
  export type PriorNotification = UndefineExcept<
    {
      expectedArrivalDate: string
      expectedLandingDate: string
      id: number
      isVesselUnderCharter: boolean
      notificationTypeLabel: string
      onBoardCatches: LogbookMessage.Catch[]
      portLocode: string
      portName: string
      purposeCode: PurposeCode
      reportingsCount: number
      seaFront: SeaFront
      sentAt: string
      tripGears: LogbookMessage.TripGear[]
      tripSegments: LogbookMessage.TripSegment[]
      types: Type[]
      vesselExternalReferenceNumber: string
      vesselFlagCountryCode: string
      // TODO Wait for vesselId in logbook reports (including "navire inconnu").
      vesselId: number
      vesselInternalReferenceNumber: string
      vesselIrcs: string
      vesselLastControlDate: string
      vesselLength: number
      vesselMmsi: string
      vesselName: string
      vesselRiskFactor: number
      vesselRiskFactorDetectability: number
      vesselRiskFactorImpact: number
      vesselRiskFactorProbability: number
    },
    'id' | 'onBoardCatches' | 'reportingsCount' | 'tripGears' | 'tripSegments' | 'types'
  >

  export type Type = {
    hasDesignatedPorts: number
    minimumNotificationPeriod: string
    name: string
  }

  // TODO Fill all the possible case. Exiting labelled enum somewhere else?
  export enum PurposeCode {
    ECY = 'ECY',
    GRD = 'GRD',
    LAN = 'LAN',
    OTH = 'OTH',
    REF = 'REF',
    REP = 'REP',
    RES = 'RES',
    SCR = 'SCR',
    SHE = 'SHE',
    TRA = 'TRA'
  }
  export const PURPOSE_LABEL: Record<PurposeCode, string> = {
    // "Emergency"
    ECY: 'Urgence',
    // "Vessels grounded and called by the authorities"
    GRD: 'Immobilisation et convocation par les autorités',
    // "Landing"
    LAN: 'Débarquement',
    // "Other"
    OTH: 'Autre',
    // "Refueling"
    REF: 'Ravitaillement',
    // "Repair"
    REP: 'Réparation',
    // "Rest"
    RES: 'Repos',
    // "Return for Scientific Research"
    SCR: 'Retour pour Recherche Scientifique',
    // "Sheltering"
    SHE: 'Mise à l’abri',
    // "Transhipment"
    TRA: 'Transbordement'
  }
}
