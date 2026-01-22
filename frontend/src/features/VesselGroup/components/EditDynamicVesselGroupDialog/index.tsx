import { useGetDistrictsQuery } from '@api/district'
import { COUNTRIES_AS_ALPHA2_OPTIONS } from '@constants/index'
import { resetInteraction } from '@features/Draw/slice'
import { useGetFleetSegmentsAsOptions } from '@features/FleetSegment/hooks/useGetFleetSegmentsAsOptions'
import { InteractionListener } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES, BLUEFIN_TUNA_SPECY_CODE } from '@features/PriorNotification/constants'
import {
  DEFAULT_VESSEL_LIST_FILTER_VALUES,
  HAS_LOGBOOK_AS_OPTIONS,
  LAST_CONTROL_PERIODS_AS_OPTIONS,
  LAST_POSITION_AS_OPTIONS,
  LastControlPeriod,
  RISK_FACTOR_AS_OPTIONS,
  VESSEL_SIZE_AS_OPTIONS,
  VesselSize
} from '@features/Vessel/components/VesselList/constants'
import { FilterTags } from '@features/Vessel/components/VesselList/FilterTags'
import { VesselEmitsPosition, VesselLocation } from '@features/Vessel/types/vessel'
import { filterVesselsWithZone } from '@features/Vessel/useCases/VesselListV2/filterVesselsWithZone'
import { useDisplayWarningWhenEditingSharedGroup } from '@features/VesselGroup/components/hooks/useDisplayWarningWhenEditingSharedGroup'
import { VesselGroupForm } from '@features/VesselGroup/components/VesselGroupForm'
import { DEFAULT_DYNAMIC_VESSEL_GROUP } from '@features/VesselGroup/constants'
import { vesselGroupActions } from '@features/VesselGroup/slice'
import {
  type CreateOrUpdateDynamicVesselGroup,
  type CreateOrUpdateVesselGroup,
  type DynamicVesselGroupFilter,
  GroupType
} from '@features/VesselGroup/types'
import { countFilteredVessels } from '@features/VesselGroup/useCases/countFilteredVessels'
import { useGetFilterableZonesAsTreeOptions } from '@hooks/useGetFilterableZonesAsTreeOptions'
import { useGetGearsAsTreeOptions } from '@hooks/useGetGearsAsTreeOptions'
import { useGetPortsAsTreeOptions } from '@hooks/useGetPortsAsTreeOptions'
import { useGetProducerOrganizationsAsOptions } from '@hooks/useGetProducerOrganizationsAsOptions'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { useListenForDrawedGeometry } from '@hooks/useListenForDrawing'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button, Checkbox, CheckPicker, Dialog, MultiCascader, pluralize, Select } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { type FormikProps } from 'formik'
import { isEqual, uniq } from 'lodash-es'
import { type MutableRefObject, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import type { VesselListFilter, ZoneFilter } from '@features/Vessel/components/VesselList/types'
import type { MultiPolygon } from 'geojson'
import type { Promisable } from 'type-fest'

type ExportActivityReportsDialogProps = {
  editedVesselGroup?: CreateOrUpdateVesselGroup
  initialListFilterValues: DynamicVesselGroupFilter
  isMainWindow?: boolean
  onExit: () => Promisable<void>
}

export function EditDynamicVesselGroupDialog({
  editedVesselGroup = undefined,
  initialListFilterValues,
  isMainWindow = false,
  onExit
}: ExportActivityReportsDialogProps) {
  const dispatch = useMainAppDispatch()

  useDisplayWarningWhenEditingSharedGroup(editedVesselGroup?.sharing, isMainWindow)

  const [listFilterValues, setListFilterValues] = useState<DynamicVesselGroupFilter>(initialListFilterValues)
  // Used to save modification when a custom zone is drawn
  const editedVesselGroupRef = useRef<CreateOrUpdateVesselGroup | undefined>(editedVesselGroup)
  const [vesselsFound, setVesselsFound] = useState<number | undefined>(undefined)
  const formRef = useRef<FormikProps<CreateOrUpdateVesselGroup>>()

  const { fleetSegmentsAsOptions } = useGetFleetSegmentsAsOptions()
  const { gearsAsTreeOptions } = useGetGearsAsTreeOptions()
  const { portsAsTreeOptions } = useGetPortsAsTreeOptions()
  const { data: districtsAsTreeOptions } = useGetDistrictsQuery()
  const { speciesAsOptions } = useGetSpeciesAsOptions()
  const filterableZoneAsTreeOptions = useGetFilterableZonesAsTreeOptions()
  const producerOrganizations = useGetProducerOrganizationsAsOptions()

  const { drawedGeometry } = useListenForDrawedGeometry(InteractionListener.EDIT_DYNAMIC_VESSEL_GROUP_DIALOG)

  const updateListFilterValuesAndCountVessels = async (nextListFilterValues: DynamicVesselGroupFilter) => {
    setListFilterValues(nextListFilterValues)

    const nextVesselsFound = await dispatch(countFilteredVessels(nextListFilterValues))
    setVesselsFound(nextVesselsFound)
  }

  useEffect(() => {
    if (drawedGeometry) {
      const zones: ZoneFilter[] = listFilterValues.zones ?? []

      const previousZonesWithoutCustomZone = zones.filter(zone => zone.value !== MonitorFishMap.MonitorFishLayer.CUSTOM)

      const nextZones = [
        ...previousZonesWithoutCustomZone,
        {
          feature: drawedGeometry as MultiPolygon,
          label: 'Zone de filtre manuelle',
          value: MonitorFishMap.MonitorFishLayer.CUSTOM
        }
      ]
      const nextListFilterValues = { ...listFilterValues, zones: nextZones }
      updateListFilterValuesAndCountVessels(nextListFilterValues)
      dispatch(resetInteraction())
    }
    // We do want to listen to only drawedGeometry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, drawedGeometry])

  const areFiltersEmpty = isEqual(listFilterValues, DEFAULT_VESSEL_LIST_FILTER_VALUES)

  const speciesAsCodeOptions =
    speciesAsOptions?.map(option => ({ label: option.label, value: option.value.code })) ?? []

  useEffect(() => {
    ;(async () => {
      const nextVesselsFound = await dispatch(countFilteredVessels(initialListFilterValues))
      setVesselsFound(nextVesselsFound)
    })()
  }, [dispatch, initialListFilterValues])

  const updateCountryCodes = async (nextCountryCodes: string[] | undefined) => {
    const nextListFilterValues = { ...listFilterValues, countryCodes: nextCountryCodes ?? [] }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateDistrictCodes = (nextDistrictCodes: string[] | undefined) => {
    const nextListFilterValues = { ...listFilterValues, districtCodes: nextDistrictCodes ?? [] }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateRiskFactors = async (nextRiskFactors: number[] | undefined) => {
    const nextListFilterValues = { ...listFilterValues, riskFactors: nextRiskFactors ?? [] }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateFleetSegments = async (nextfleetSegments: string[] | undefined) => {
    const nextListFilterValues = { ...listFilterValues, fleetSegments: nextfleetSegments ?? [] }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateGearCodes = async (nextGearCodes: string[] | undefined) => {
    const nextListFilterValues = { ...listFilterValues, gearCodes: nextGearCodes ?? [] }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateZones = async (nextZonesNames: string[] | undefined) => {
    assertNotNullish(filterableZoneAsTreeOptions)
    if (isMainWindow) {
      assertNotNullish(editedVesselGroupRef.current)

      // We store the modified vessel group before closing the dialog
      dispatch(
        vesselGroupActions.vesselGroupEdited({
          ...editedVesselGroupRef.current,
          filters: listFilterValues
        } as CreateOrUpdateDynamicVesselGroup)
      )
    }
    const nextZones = await dispatch(
      filterVesselsWithZone(
        filterableZoneAsTreeOptions,
        InteractionListener.EDIT_DYNAMIC_VESSEL_GROUP_DIALOG,
        nextZonesNames,
        listFilterValues.zones
      )
    )
    if (nextZones !== undefined) {
      const nextListFilterValues = { ...listFilterValues, zones: nextZones }
      updateListFilterValuesAndCountVessels(nextListFilterValues)
    }
  }

  const updateCustomZones = async (checked: boolean | undefined) => {
    const zones = listFilterValues.zones?.map(zone => zone.value) ?? []

    updateZones(
      checked
        ? zones.concat(MonitorFishMap.MonitorFishLayer.CUSTOM)
        : zones.filter(zone => zone === MonitorFishMap.MonitorFishLayer.CUSTOM)
    )
  }

  const updateLastControlAtSeaPeriod = (nextLastControlPeriod: LastControlPeriod | undefined) => {
    const nextListFilterValues = { ...listFilterValues, lastControlAtSeaPeriod: nextLastControlPeriod }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateLastControlAtQuayPeriod = (nextLastControlPeriod: LastControlPeriod | undefined) => {
    const nextListFilterValues = { ...listFilterValues, lastControlAtQuayPeriod: nextLastControlPeriod }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateVesselSize = async (nextVesselSize: VesselSize | undefined) => {
    const nextListFilterValues = { ...listFilterValues, vesselSize: nextVesselSize }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateProducerOrganizations = async (nextProducerOrganizations: string[] | undefined) => {
    const nextListFilterValues = { ...listFilterValues, producerOrganizations: nextProducerOrganizations ?? [] }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateLastPositionHoursAgo = async (nextLastPositionHoursAgo: number | undefined) => {
    const nextListFilterValues = { ...listFilterValues, lastPositionHoursAgo: nextLastPositionHoursAgo }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateHasLogbook = async (nextHasLogbook: boolean | undefined) => {
    const nextListFilterValues = { ...listFilterValues, hasLogbook: nextHasLogbook }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const isAtSea = !!listFilterValues.vesselsLocation?.includes(VesselLocation.SEA)
  const isAtPort = !!listFilterValues.vesselsLocation?.includes(VesselLocation.PORT)

  const emitsPositions = !!listFilterValues.emitsPositions?.includes(VesselEmitsPosition.YES)
  const emitsNoPositions = !!listFilterValues.emitsPositions?.includes(VesselEmitsPosition.NO)

  const updateVesselLocationAtSea = async (nextAtSea: boolean | undefined) => {
    const nextVesselsLocation = nextAtSea ? [VesselLocation.SEA] : []
    const previousAtPort = isAtPort ? [VesselLocation.PORT] : []
    const nextListFilterValues = { ...listFilterValues, vesselsLocation: previousAtPort.concat(nextVesselsLocation) }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateVesselLocationAtPort = async (nextAtPort: boolean | undefined) => {
    const nextVesselsLocation = nextAtPort ? [VesselLocation.PORT] : []
    const previousAtSea = isAtSea ? [VesselLocation.SEA] : []
    const nextListFilterValues = { ...listFilterValues, vesselsLocation: previousAtSea.concat(nextVesselsLocation) }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateEmitsPositions = (value: boolean | undefined) => {
    const nextEmitsPositions = value ? [VesselEmitsPosition.YES] : []
    const previousEmitsNoPositions = emitsNoPositions ? [VesselEmitsPosition.NO] : []
    const nextListFilterValues = {
      ...listFilterValues,
      emitsPositions: previousEmitsNoPositions.concat(nextEmitsPositions)
    }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateEmitsNoPositions = (value: boolean | undefined) => {
    const nextEmitsNoPositions = value ? [VesselEmitsPosition.NO] : []
    const previousEmitsPositions = emitsNoPositions ? [VesselEmitsPosition.YES] : []
    const nextListFilterValues = {
      ...listFilterValues,
      emitsPositions: previousEmitsPositions.concat(nextEmitsNoPositions)
    }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateSpecyCodes = async (nextSpecyCodes: string[] | undefined) => {
    const normalizedNextSpecyCodes = nextSpecyCodes?.includes(BLUEFIN_TUNA_SPECY_CODE)
      ? uniq([...nextSpecyCodes, ...BLUEFIN_TUNA_EXTENDED_SPECY_CODES])
      : nextSpecyCodes

    const nextListFilterValues = { ...listFilterValues, specyCodes: normalizedNextSpecyCodes ?? [] }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateLandingPortLocodes = (nextLandingPortLocodes: string[] | undefined) => {
    const nextListFilterValues = { ...listFilterValues, landingPortLocodes: nextLandingPortLocodes ?? [] }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const createOrModifyText =
    !!editedVesselGroup && !isEqual(editedVesselGroup, DEFAULT_DYNAMIC_VESSEL_GROUP) ? 'Modifier' : 'Créer'

  const renderMultiCascaderCustomZoneFooter = () => (
    <MultiCascaderCustomZone>
      <Checkbox
        checked={listFilterValues.zones?.some(zone => zone.value === MonitorFishMap.MonitorFishLayer.CUSTOM)}
        inline
        label="Filtrer avec une zone dessinée sur la carte"
        name="custom_zone"
        onChange={updateCustomZones}
      >
        Filtrer avec une zone dessinée sur la carte
      </Checkbox>
    </MultiCascaderCustomZone>
  )

  return (
    <StyledDialog isAbsolute>
      <StyledDialogTitle>{createOrModifyText} un groupe de navires dynamique</StyledDialogTitle>
      <StyledDialogBody>
        <VesselsCount>
          Actuellement,{' '}
          <b>{vesselsFound !== undefined ? `${vesselsFound} ${pluralize('navire', vesselsFound)}` : '... navires'}</b>{' '}
          {vesselsFound === 1 ? 'correspond' : 'correspondent'} aux filtres sélectionnés.
        </VesselsCount>
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
            disabled={!portsAsTreeOptions}
            isLabelHidden
            isTransparent
            label="Ports de débarque"
            name="portLocodes"
            onChange={updateLandingPortLocodes}
            options={portsAsTreeOptions ?? []}
            placeholder="Ports de débarque"
            popupWidth={500}
            renderValue={(_, items) =>
              items.length > 0 ? <SelectValue>Ports de débarque ({items.length})</SelectValue> : <></>
            }
            searchable
            value={listFilterValues.landingPortLocodes}
          />
          <Select
            isLabelHidden
            isTransparent
            label="Dernier contrôle mer"
            name="lastControlAtSeaPeriod"
            onChange={updateLastControlAtSeaPeriod}
            options={LAST_CONTROL_PERIODS_AS_OPTIONS}
            placeholder="Dernier contrôle mer"
            popupWidth={224}
            value={listFilterValues.lastControlAtSeaPeriod}
          />
          <Select
            isLabelHidden
            isTransparent
            label="Dernier contrôle quai"
            name="lastControlAtQuayPeriod"
            onChange={updateLastControlAtQuayPeriod}
            options={LAST_CONTROL_PERIODS_AS_OPTIONS}
            placeholder="Dernier contrôle quai"
            popupWidth={224}
            value={listFilterValues.lastControlAtQuayPeriod}
          />
          <CheckPicker
            isLabelHidden
            isTransparent
            label="Adhésion à une OP"
            name="producerOrganizations"
            onChange={updateProducerOrganizations}
            options={producerOrganizations}
            placeholder="Adhésion à une OP"
            popupWidth={320}
            renderValue={(_, items) => (items.length > 0 ? <SelectValue>OP ({items.length})</SelectValue> : <></>)}
            searchable
            value={listFilterValues.producerOrganizations}
          />
          <MultiCascader
            disabled={!filterableZoneAsTreeOptions}
            isLabelHidden
            isTransparent
            label="Zones"
            name="zones"
            onChange={updateZones}
            options={filterableZoneAsTreeOptions?.filter(zone => zone.label !== 'Zone manuelle') ?? []}
            placeholder="Zones"
            popupWidth={500}
            renderExtraFooter={renderMultiCascaderCustomZoneFooter}
            renderValue={(_, items) => {
              const itemsChildrens = items.filter(item => item.parent !== null)

              return itemsChildrens.length > 0 ? (
                <SelectValue>Zone de filtre ({itemsChildrens.length})</SelectValue>
              ) : (
                <></>
              )
            }}
            searchable
            uncheckableItemValues={['0', '1', '2', '3']}
            value={listFilterValues.zones?.map(zone => zone.value)}
          />
          <MultiCascader
            isLabelHidden
            isTransparent
            label="Quartier"
            name="districtCodes"
            onChange={updateDistrictCodes}
            options={districtsAsTreeOptions ?? []}
            placeholder="Quartier"
            popupWidth={500}
            renderValue={(_, items) =>
              items.length > 0 ? <SelectValue>Quartier ({items.length})</SelectValue> : <></>
            }
            searchable
            value={listFilterValues.districtCodes}
          />
          <Select
            isLabelHidden
            isTransparent
            label="Longueur du navire"
            name="vesselSize"
            onChange={updateVesselSize}
            options={VESSEL_SIZE_AS_OPTIONS}
            placeholder="Longueur du navire"
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
            value={listFilterValues.hasLogbook}
          />
          <div style={{ width: 200 }} />
          <Checkbox checked={emitsPositions} label="Équipé VMS" name="emitsPositions" onChange={updateEmitsPositions} />
          <Checkbox
            checked={emitsNoPositions}
            label="Non équipé VMS"
            name="emitsNoPositions"
            onChange={updateEmitsNoPositions}
          />
          <VerticalBar />
          <Checkbox checked={isAtSea} label="En mer" name="always" onChange={updateVesselLocationAtSea} />
          <Checkbox checked={isAtPort} label="À quai" name="always" onChange={updateVesselLocationAtPort} />
        </Row>
        <StyledFilterTags
          listFilterValues={listFilterValues as VesselListFilter}
          onFilter={nextListFilterValues => updateListFilterValuesAndCountVessels(nextListFilterValues)}
          onReset={() => updateListFilterValuesAndCountVessels(DEFAULT_VESSEL_LIST_FILTER_VALUES)}
        />
        <VesselGroupForm
          editedVesselGroup={editedVesselGroup}
          formRef={formRef as MutableRefObject<FormikProps<CreateOrUpdateVesselGroup>>}
          groupType={GroupType.DYNAMIC}
          isMainWindow={isMainWindow}
          listFilterValues={listFilterValues}
          onChange={nextValues => {
            editedVesselGroupRef.current = nextValues
          }}
          onExit={onExit}
        />
      </StyledDialogBody>
      <StyledDialogAction>
        <Button accent={Accent.PRIMARY} disabled={areFiltersEmpty} onClick={() => formRef.current?.handleSubmit()}>
          {String(`${createOrModifyText} le groupe`)}
        </Button>
        <Button accent={Accent.TERTIARY} onClick={onExit}>
          Annuler
        </Button>
      </StyledDialogAction>
    </StyledDialog>
  )
}

const MultiCascaderCustomZone = styled.div`
  border-top: 1px solid ${p => p.theme.color.lightGray};
  padding: 8px;
`

const VerticalBar = styled.span`
  background: ${p => p.theme.color.lightGray};
  height: 20px;
  width: 2px;
  margin-top: 16px;
  margin-right: 16px;
`

const StyledFilterTags = styled(FilterTags)`
  margin-right: 16px;
  margin-bottom: 16px;
`

const VesselsCount = styled.div`
  text-align: left;
  margin-bottom: 8px;
`

const StyledDialog = styled(Dialog)`
  > div:last-child {
    min-width: 1224px;
    max-width: 1224px;
  }
`

const StyledDialogTitle = styled(Dialog.Title)`
  line-height: 48px;
  margin: 0;
`

const StyledDialogAction = styled(Dialog.Action)`
  padding: 24px 8px;
`

const StyledDialogBody = styled(Dialog.Body)`
  padding: 45px 80px;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;

  > .Element-Field:not(:nth-child(-n + 5)) {
    margin-top: 16px;
  }

  > .Element-Field:not(:nth-child(5)):not(:nth-child(10)) {
    margin-right: 16px;
  }

  > .Field-MultiCascader,
  > .Field-CheckPicker,
  > .Field-Select,
  > .Element-Fieldset {
    min-width: 200px;
    width: 160px;
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
