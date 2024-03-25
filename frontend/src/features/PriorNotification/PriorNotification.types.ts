import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { SeaFront } from 'domain/entities/seaFront/constants'

export namespace PriorNotification {
  export type PriorNotification = {
    expectedArrivalDate: string | undefined
    expectedLandingDate: string | undefined
    id: number
    isVesselUnderCharter: boolean | undefined
    notificationTypeLabel: string | undefined
    onBoardCatches: LogbookMessage.Catch[]
    portLocode: string | undefined
    portName: string | undefined
    purposeCode: PurposeCode | undefined
    reportingsCount: number
    seaFront: SeaFront | undefined
    sentAt: string | undefined
    tripGears: LogbookMessage.TripGear[]
    tripSegments: LogbookMessage.TripSegment[]
    types: Type[]
    // TODO Wait for vesselId in logbook reports (including "navire inconnu").
    vessel: Vessel.Vessel
    vesselLastControlDate: string | undefined
    vesselRiskFactor: number | undefined
    vesselRiskFactorDetectability: number | undefined
    vesselRiskFactorImpact: number | undefined
    vesselRiskFactorProbability: number | undefined
  }

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
