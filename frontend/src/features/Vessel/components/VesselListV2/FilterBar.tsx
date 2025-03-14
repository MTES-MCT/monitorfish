import { COUNTRIES_AS_ALPHA2_OPTIONS } from '@constants/index'
import { useGetFleetSegmentsAsOptions } from '@features/FleetSegment/hooks/useGetFleetSegmentsAsOptions'
import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES, BLUEFIN_TUNA_SPECY_CODE } from '@features/PriorNotification/constants'
import { VesselLocation } from '@features/Vessel/types/vessel'
import { filterVessels } from '@features/Vessel/useCases/VesselListV2/filterVessels'
import { useGetGearsAsTreeOptions } from '@hooks/useGetGearsAsTreeOptions'
import { useGetOrganizationMembershipNamesAsOptions } from '@hooks/useGetOrganizationMembershipNamesAsOptions'
import { useGetPortsAsTreeOptions } from '@hooks/useGetPortsAsTreeOptions'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Checkbox, CheckPicker, Icon, MultiCascader, Select, Size, TextInput } from '@mtes-mct/monitor-ui'
import { uniq } from 'lodash-es'
import styled from 'styled-components'

import {
  HAS_LOGBOOK_AS_OPTIONS,
  LAST_CONTROL_PERIODS_AS_OPTIONS,
  LAST_POSITION_AS_OPTIONS,
  LastControlPeriod,
  RISK_FACTOR_AS_OPTIONS,
  VESSEL_SIZE_AS_OPTIONS,
  VesselSize
} from './constants'

export function FilterBar() {
  const dispatch = useMainAppDispatch()
  const listFilterValues = useMainAppSelector(store => store.vessel.listFilterValues)

  const { fleetSegmentsAsOptions } = useGetFleetSegmentsAsOptions()
  const { gearsAsTreeOptions } = useGetGearsAsTreeOptions()
  const { portsAsTreeOptions } = useGetPortsAsTreeOptions()
  const { speciesAsOptions } = useGetSpeciesAsOptions()
  const organizationMembershipNames = useGetOrganizationMembershipNamesAsOptions()

  const speciesAsCodeOptions =
    speciesAsOptions?.map(option => ({ label: option.label, value: option.value.code })) ?? []

  const updateCountryCodes = (nextCountryCodes: string[] | undefined) => {
    dispatch(filterVessels({ countryCodes: nextCountryCodes }))
  }

  const updateRiskFactors = (nextRiskFactors: number[] | undefined) => {
    dispatch(filterVessels({ riskFactors: nextRiskFactors }))
  }

  const updateFleetSegments = (nextfleetSegments: string[] | undefined) => {
    dispatch(filterVessels({ fleetSegments: nextfleetSegments }))
  }

  const updateGearCodes = (nextGearCodes: string[] | undefined) => {
    dispatch(filterVessels({ gearCodes: nextGearCodes }))
  }

  const updateLastControlPeriod = (nextLastControlPeriod: LastControlPeriod | undefined) => {
    dispatch(filterVessels({ lastControlPeriod: nextLastControlPeriod }))
  }

  const updateVesselSize = (nextVesselSize: VesselSize | undefined) => {
    dispatch(filterVessels({ vesselSize: nextVesselSize }))
  }

  const updateLastLandingPortLocodes = (nextPortLocodes: string[] | undefined) => {
    dispatch(filterVessels({ lastLandingPortLocodes: nextPortLocodes }))
  }

  const updateProducerOrganizations = (nextProducerOrganizations: string[] | undefined) => {
    dispatch(filterVessels({ producerOrganizations: nextProducerOrganizations }))
  }

  const updateLastPositionHoursAgo = (nextLastPositionHoursAgo: number | undefined) => {
    dispatch(filterVessels({ lastPositionHoursAgo: nextLastPositionHoursAgo }))
  }

  const updateHasLogbook = (nextHasLogbook: boolean | undefined) => {
    dispatch(filterVessels({ hasLogbook: nextHasLogbook }))
  }

  const isAtSea = !!listFilterValues.vesselsLocation?.includes(VesselLocation.SEA)
  const isAtPort = !!listFilterValues.vesselsLocation?.includes(VesselLocation.PORT)

  const updateVesselLocationAtSea = (nextAtSea: boolean | undefined) => {
    const nextVesselsLocation = nextAtSea ? [VesselLocation.SEA] : []
    const previousAtPort = isAtPort ? [VesselLocation.PORT] : []
    dispatch(filterVessels({ vesselsLocation: previousAtPort.concat(nextVesselsLocation) }))
  }

  const updateVesselLocationAtPort = (nextAtPort: boolean | undefined) => {
    const nextVesselsLocation = nextAtPort ? [VesselLocation.PORT] : []
    const previousAtSea = isAtSea ? [VesselLocation.SEA] : []
    dispatch(filterVessels({ vesselsLocation: previousAtSea.concat(nextVesselsLocation) }))
  }

  const updateSpecyCodes = (nextSpecyCodes: string[] | undefined) => {
    const normalizedNextSpecyCodes = nextSpecyCodes?.includes(BLUEFIN_TUNA_SPECY_CODE)
      ? uniq([...nextSpecyCodes, ...BLUEFIN_TUNA_EXTENDED_SPECY_CODES])
      : nextSpecyCodes

    dispatch(filterVessels({ specyCodes: normalizedNextSpecyCodes }))
  }

  return (
    <Wrapper className="vessel-list-filter-bar">
      <Row>
        <TextInput
          disabled
          Icon={Icon.Search}
          isLabelHidden
          isTransparent
          label="Rechercher un navire"
          name="searchQuery"
          onChange={() => {}}
          placeholder="Rechercher un navire"
          size={Size.LARGE}
          value={undefined}
        />
      </Row>

      <Row>
        <CheckPicker
          isLabelHidden
          isTransparent
          label="Nationalités"
          name="countryCodes"
          onChange={updateCountryCodes}
          options={COUNTRIES_AS_ALPHA2_OPTIONS}
          placeholder="Nationalité"
          popupWidth={240}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Nationalités ({items.length})</SelectValue> : <></>
          }
          searchable
          value={listFilterValues.countryCodes}
          virtualized
        />
        <CheckPicker
          isLabelHidden
          isTransparent
          label="Note de risque"
          name="riskFactors"
          onChange={updateRiskFactors}
          options={RISK_FACTOR_AS_OPTIONS}
          placeholder="Note de risque"
          popupWidth={240}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Notes de risque ({items.length})</SelectValue> : <></>
          }
          searchable
          value={listFilterValues.riskFactors}
          virtualized
        />
        <CheckPicker
          disabled={!fleetSegmentsAsOptions}
          isLabelHidden
          isTransparent
          label="Segments de flotte"
          name="fleetSegments"
          onChange={updateFleetSegments}
          options={fleetSegmentsAsOptions ?? []}
          placeholder="Segments de flotte"
          popupWidth={320}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Segments de flotte ({items.length})</SelectValue> : <></>
          }
          searchable
          value={listFilterValues.fleetSegments}
          virtualized
        />
        <MultiCascader
          disabled={!gearsAsTreeOptions}
          isLabelHidden
          isTransparent
          label="Engins utilisés"
          name="gearCodes"
          onChange={updateGearCodes}
          options={gearsAsTreeOptions ?? []}
          placeholder="Engins utilisés"
          popupWidth={500}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Engins utilisés ({items.length})</SelectValue> : <></>
          }
          searchable
          value={listFilterValues.gearCodes}
        />
        <CheckPicker
          disabled={!speciesAsCodeOptions}
          isLabelHidden
          isTransparent
          label="Espèces à bord"
          name="specyCodes"
          onChange={updateSpecyCodes}
          options={speciesAsCodeOptions ?? []}
          placeholder="Espèces à bord"
          popupWidth={320}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Espèces à bord ({items.length})</SelectValue> : <></>
          }
          searchable
          value={listFilterValues.specyCodes}
          virtualized
        />
        <MultiCascader
          disabled
          isLabelHidden
          isTransparent
          label="Dernier port de débarque"
          name="lastLandingPortLocodes"
          onChange={updateLastLandingPortLocodes}
          options={portsAsTreeOptions ?? []}
          placeholder="Dernier port de débarque"
          popupWidth={500}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Dernier port de débarque ({items.length})</SelectValue> : <></>
          }
          searchable
          style={{ width: 230 }}
          value={listFilterValues.lastLandingPortLocodes}
        />
        <Select
          isLabelHidden
          isTransparent
          label="Date du dernier contrôle"
          name="lastControlPeriod"
          onChange={updateLastControlPeriod}
          options={LAST_CONTROL_PERIODS_AS_OPTIONS}
          placeholder="Date du dernier contrôle"
          popupWidth={224}
          // renderValue={value => (value !== undefined ? <SelectValue>Date du dernier contrôle (1)</SelectValue> : <></>)}
          style={{ width: 230 }}
          value={listFilterValues.lastControlPeriod}
        />
        <CheckPicker
          disabled
          isLabelHidden
          isTransparent
          label="Adhésion à une OP"
          name="producerOrganizations"
          onChange={updateProducerOrganizations}
          options={organizationMembershipNames}
          placeholder="Adhésion à une OP"
          popupWidth={320}
          renderValue={(_, items) => (items.length > 0 ? <SelectValue>OP ({items.length})</SelectValue> : <></>)}
          searchable
          value={listFilterValues.producerOrganizations}
        />
        <Select
          isLabelHidden
          isTransparent
          label="Longueur du navire"
          name="vesselSize"
          onChange={updateVesselSize}
          options={VESSEL_SIZE_AS_OPTIONS}
          placeholder="Longueur du navire"
          // renderValue={value => (value !== undefined ? <SelectValue>Longueur du navire (1)</SelectValue> : <></>)}
          value={listFilterValues.vesselSize}
        />
        <Select
          isLabelHidden
          isTransparent
          label="Dernière position VMS"
          name="lastPositionHoursAgo"
          onChange={updateLastPositionHoursAgo}
          options={LAST_POSITION_AS_OPTIONS}
          placeholder="Dernière position VMS"
          // renderValue={value => (value !== undefined ? <SelectValue>Dernière position VMS (1)</SelectValue> : <></>)}
          style={{ width: 210 }}
          value={listFilterValues.lastPositionHoursAgo}
        />
        <Select
          isLabelHidden
          isTransparent
          label="Equipé JPE"
          name="hasLogbook"
          onChange={updateHasLogbook}
          options={HAS_LOGBOOK_AS_OPTIONS}
          placeholder="Equipé JPE"
          // renderValue={value => (value !== undefined ? <SelectValue>Equipé JPE (1)</SelectValue> : <></>)}
          value={listFilterValues.hasLogbook}
        />
        <Checkbox checked={isAtSea} label="En mer" name="always" onChange={updateVesselLocationAtSea} />
        <Checkbox checked={isAtPort} label="À quai" name="always" onChange={updateVesselLocationAtPort} />
      </Row>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;

  > .Element-Field {
    margin-top: 16px;
    margin-left: 16px;
  }

  > .Field-MultiCascader,
  > .Field-CheckPicker,
  > .Field-Select,
  > .Element-Fieldset {
    min-width: 200px;
    width: 160px;
  }

  > .Field-TextInput {
    min-width: 280px;
  }

  > .Field-MultiCheckbox {
    min-width: 320px;
  }
`

const SelectValue = styled.span`
  display: flex;
  overflow: hidden;
  pointer-events: none;
  text-overflow: ellipsis;
  white-space: nowrap;
`
