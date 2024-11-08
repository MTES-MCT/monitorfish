import { UNKNOWN_COUNTRY_CODE } from '@constants/index'
import {
  SeafrontGroup,
  type NoSeafrontGroup,
  NO_SEAFRONT_GROUP,
  ALL_SEAFRONT_GROUP,
  type AllSeafrontGroup
} from '@constants/seafront'
import { Logbook } from '@features/Logbook/Logbook.types'
import {
  BLUEFIN_TUNA_EXTENDED_SPECY_CODES,
  BLUEFIN_TUNA_NAME_FR,
  BLUEFIN_TUNA_SPECY_CODE
} from '@features/PriorNotification/constants'
import { THEME, customDayjs, getMaybeBooleanFromRichBoolean, type DateAsStringRange } from '@mtes-mct/monitor-ui'
import { VesselIdentifier } from 'domain/entities/vessel/types'
import { update } from 'lodash'
import styled from 'styled-components'

import {
  COMMUNITY_PRIOR_NOTIFICATION_TYPES,
  DESIGNATED_PORTS_PRIOR_NOTIFICATION_TYPE_PREFIX,
  ExpectedArrivalPeriod,
  IS_INVALIDATED,
  IS_INVALIDATED_LABEL,
  IS_PRIOR_NOTIFICATION_ZERO,
  LastControlPeriod,
  SUB_MENU_LABEL
} from './constants'
import { PriorNotification } from '../../PriorNotification.types'

import type { FilterStatus, ListFilter } from './types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { CSSProperties } from 'react'

export function displayOnboardFishingSpecies(onBoardCatches: Logbook.Catch[]) {
  const heaviestOnBoardCatches = onBoardCatches
    .reduce<
      Array<{
        specyCode: string
        specyName: string
        weight: number
      }>
    >((aggregatedCatches, currentCatch) => {
      const [normalizedSpecyCode, normalizedSpecyName] = BLUEFIN_TUNA_EXTENDED_SPECY_CODES.includes(
        currentCatch.species
      )
        ? [BLUEFIN_TUNA_SPECY_CODE, BLUEFIN_TUNA_NAME_FR]
        : [currentCatch.species, currentCatch.speciesName]
      const existingCatchSpecyIndex = aggregatedCatches.findIndex(
        aggregatedCatch => aggregatedCatch.specyCode === normalizedSpecyCode
      )
      if (
        existingCatchSpecyIndex > -1 &&
        currentCatch.weight !== undefined &&
        aggregatedCatches[existingCatchSpecyIndex]?.weight !== undefined
      ) {
        return update(aggregatedCatches, `[${existingCatchSpecyIndex}].weight`, weight => weight + currentCatch.weight)
      }

      return [
        ...aggregatedCatches,
        {
          specyCode: normalizedSpecyCode,
          specyName: normalizedSpecyName,
          weight: currentCatch.weight
        }
      ]
    }, [])
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)

  return heaviestOnBoardCatches.map(({ specyCode, specyName, weight }) => (
    <StyledLi
      key={specyCode}
      title={`${specyName} (${specyCode}) – ${weight} kg`}
    >{`${specyName} (${specyCode}) – ${weight} kg`}</StyledLi>
  ))
}

function getApiFilterFromExpectedArrivalPeriod(
  period: ExpectedArrivalPeriod,
  customPeriod: DateAsStringRange | undefined
): Logbook.ApiFilter {
  if (customPeriod) {
    return {
      willArriveAfter: customPeriod[0],
      willArriveBefore: customPeriod[1]
    }
  }

  switch (period) {
    case ExpectedArrivalPeriod.IN_LESS_THAN_TWO_HOURS:
      return {
        willArriveAfter: customDayjs.utc().toISOString(),
        willArriveBefore: customDayjs.utc().add(2, 'hours').toISOString()
      }

    // Since this is the default period, we also use for the custom period when the date range input is not yet filled.
    case ExpectedArrivalPeriod.IN_LESS_THAN_FOUR_HOURS:
    case ExpectedArrivalPeriod.CUSTOM:
      return {
        willArriveAfter: customDayjs.utc().toISOString(),
        willArriveBefore: customDayjs.utc().add(4, 'hours').toISOString()
      }

    case ExpectedArrivalPeriod.IN_LESS_THAN_EIGTH_HOURS:
      return {
        willArriveAfter: customDayjs.utc().toISOString(),
        willArriveBefore: customDayjs.utc().add(8, 'hours').toISOString()
      }

    case ExpectedArrivalPeriod.IN_LESS_THAN_TWELVE_HOURS:
      return {
        willArriveAfter: customDayjs.utc().toISOString(),
        willArriveBefore: customDayjs.utc().add(12, 'hours').toISOString()
      }

    case ExpectedArrivalPeriod.IN_LESS_THAN_ONE_DAY:
      return {
        willArriveAfter: customDayjs.utc().toISOString(),
        willArriveBefore: customDayjs.utc().add(1, 'day').toISOString()
      }

    case ExpectedArrivalPeriod.IN_LESS_THAN_ONE_MONTH:
      return {
        willArriveAfter: customDayjs.utc().toISOString(),
        willArriveBefore: customDayjs.utc().add(1, 'month').toISOString()
      }

    case ExpectedArrivalPeriod.LAST_DAY:
      return {
        willArriveAfter: customDayjs.utc().subtract(1, 'day').toISOString(),
        willArriveBefore: customDayjs.utc().toISOString()
      }

    default:
      return {}
  }
}

function getApiFilterFromLastControlPeriod(period: LastControlPeriod | undefined): Logbook.ApiFilter {
  switch (period) {
    case LastControlPeriod.AFTER_ONE_MONTH_AGO:
      return {
        lastControlledAfter: customDayjs().subtract(1, 'month').toISOString()
      }

    case LastControlPeriod.BEFORE_ONE_MONTH_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(1, 'month').toISOString()
      }

    case LastControlPeriod.BEFORE_THREE_MONTHS_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(3, 'month').toISOString()
      }

    case LastControlPeriod.BEFORE_SIX_MONTHS_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(6, 'month').toISOString()
      }

    case LastControlPeriod.BEFORE_ONE_YEAR_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(1, 'year').toISOString()
      }

    case LastControlPeriod.BEFORE_TWO_YEARS_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(2, 'year').toISOString()
      }

    default:
      return {}
  }
}

export function getColorsFromState(state: PriorNotification.State | undefined): {
  backgroundColor: string
  borderColor: string
  color: string
} {
  // [backgroundColor, borderColor, color]
  let colors: [string, string, string]

  switch (state) {
    case PriorNotification.State.FAILED_SEND:
      colors = [THEME.color.maximumRed15, THEME.color.maximumRed15, THEME.color.maximumRed]
      break

    case PriorNotification.State.PENDING_VERIFICATION:
      colors = [THEME.color.goldenPoppyBorder, THEME.color.goldenPoppyBorder, THEME.color.charcoal]
      break

    case PriorNotification.State.AUTO_SEND_REQUESTED:
    case PriorNotification.State.AUTO_SEND_DONE:
      colors = [THEME.color.lightGray, THEME.color.lightGray, THEME.color.charcoal]
      break

    case PriorNotification.State.PENDING_AUTO_SEND:
    case PriorNotification.State.PENDING_SEND:
      colors = [THEME.color.gainsboro, THEME.color.gainsboro, THEME.color.slateGray]
      break

    case PriorNotification.State.VERIFIED_AND_SENT:
      colors = [THEME.color.mediumSeaGreen25, THEME.color.mediumSeaGreen25, THEME.color.mediumSeaGreen]
      break

    case PriorNotification.State.OUT_OF_VERIFICATION_SCOPE:
    default:
      colors = [THEME.color.white, THEME.color.charcoal, THEME.color.charcoal]
      break
  }

  return {
    backgroundColor: colors[0],
    borderColor: colors[1],
    color: colors[2]
  }
}

export function getExpandableRowCellCustomStyle(columnId: string): CSSProperties {
  switch (columnId) {
    case Logbook.ApiSortColumn.VESSEL_RISK_FACTOR:
    case 'actions':
      return { verticalAlign: 'bottom' }

    case 'state':
      return { padding: '7px 14px', verticalAlign: 'bottom' }

    default:
      return {}
  }
}

function getStatesFromFilterStatuses(statuses: FilterStatus[] | undefined): PriorNotification.State[] | undefined {
  if (!statuses) {
    return undefined
  }

  const states = statuses.filter(status => status !== IS_INVALIDATED && status !== IS_PRIOR_NOTIFICATION_ZERO)

  return [
    ...states,
    ...(states.includes(PriorNotification.State.VERIFIED_AND_SENT) ? [PriorNotification.State.PENDING_SEND] : []),
    ...(states.includes(PriorNotification.State.AUTO_SEND_DONE) ? [PriorNotification.State.PENDING_AUTO_SEND] : [])
  ]
}

export function getStaticApiFilterFromListFilter(listFilter: ListFilter): Logbook.ApiFilter {
  return {
    flagStates: listFilter.countryCodes,
    hasOneOrMoreReportings: getMaybeBooleanFromRichBoolean(listFilter.hasOneOrMoreReportings),
    // We don't want to send `false` when it's unchecked because it would exclude invalidated prior notifications
    isInvalidated: listFilter.statuses?.includes(IS_INVALIDATED) ? true : undefined,
    isLessThanTwelveMetersVessel: getMaybeBooleanFromRichBoolean(listFilter.isLessThanTwelveMetersVessel),
    // We don't want to send `false` when it's unchecked because it would exclude "Préavis Zéro" prior notifications
    isPriorNotificationZero: listFilter.statuses?.includes(IS_PRIOR_NOTIFICATION_ZERO) ? true : undefined,
    portLocodes: listFilter.portLocodes,
    priorNotificationTypes: listFilter.priorNotificationTypes,
    seafrontGroup: listFilter.seafrontGroup,
    searchQuery: listFilter.searchQuery,
    specyCodes: listFilter.specyCodes,
    states: getStatesFromFilterStatuses(listFilter.statuses),
    tripGearCodes: listFilter.gearCodes,
    tripSegmentCodes: listFilter.fleetSegmentSegments,
    ...getApiFilterFromExpectedArrivalPeriod(listFilter.expectedArrivalPeriod, listFilter.expectedArrivalCustomPeriod),
    ...getApiFilterFromLastControlPeriod(listFilter.lastControlPeriod)
  }
}

export function getStatusTagLabel(status: FilterStatus): string {
  switch (status) {
    case IS_INVALIDATED:
      return IS_INVALIDATED_LABEL

    case IS_PRIOR_NOTIFICATION_ZERO:
      return 'Préavis Zéro'

    default:
      return PriorNotification.STATE_LABEL[status]
  }
}

export function getVesselIdentityFromPriorNotification(
  priorNotification: PriorNotification.PriorNotification
): Vessel.VesselIdentity {
  return {
    beaconNumber: undefined,
    districtCode: undefined,
    externalReferenceNumber: priorNotification.vesselExternalReferenceNumber,
    flagState: priorNotification.vesselFlagCountryCode ?? UNKNOWN_COUNTRY_CODE,
    internalReferenceNumber: priorNotification.vesselInternalReferenceNumber,
    ircs: priorNotification.vesselIrcs,
    mmsi: priorNotification.vesselMmsi,
    vesselId: priorNotification.vesselId,
    // In practice, prior notifications always have a vessel CFR (`vesselInternalReferenceNumber`)
    // despite the `| undefined`
    vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
    vesselName: priorNotification.vesselName
  }
}

export function sortPriorNotificationTypesByPriority(priorNotificationTypes: string[]) {
  const communityTypes: string[] = []
  const designatedPortsTypes: string[] = []

  priorNotificationTypes.forEach(type => {
    if (COMMUNITY_PRIOR_NOTIFICATION_TYPES.includes(type)) {
      communityTypes.push(type)
    }
    if (type.startsWith(DESIGNATED_PORTS_PRIOR_NOTIFICATION_TYPE_PREFIX)) {
      designatedPortsTypes.push(type)
    }
  })

  const otherTypes = priorNotificationTypes
    .filter(type => !communityTypes.includes(type) && !designatedPortsTypes.includes(type))
    .sort()

  return [...communityTypes.sort(), ...designatedPortsTypes.sort(), ...otherTypes]
}

export function getTitle(seafrontGroup: SeafrontGroup | AllSeafrontGroup | NoSeafrontGroup) {
  switch (seafrontGroup) {
    case ALL_SEAFRONT_GROUP:
      return 'Tous les préavis'

    case NO_SEAFRONT_GROUP:
      return 'Préavis hors façade'

    default:
      return `Préavis en ${SUB_MENU_LABEL[seafrontGroup]}`
  }
}

const StyledLi = styled.li`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 215px;
`
