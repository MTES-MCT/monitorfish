import { COUNTRIES_AS_ALPHA2_OPTIONS } from '@constants/index'
import { resetInteraction } from '@features/Draw/slice'
import { useGetFleetSegmentsAsOptions } from '@features/FleetSegment/hooks/useGetFleetSegmentsAsOptions'
import { InteractionListener, LayerProperties } from '@features/Map/constants'
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
import { VesselLocation } from '@features/Vessel/types/vessel'
import { filterVesselsWithZone } from '@features/Vessel/useCases/VesselListV2/filterVesselsWithZone'
import { FormikCirclePicker } from '@features/VesselGroup/components/EditDynamicVesselGroupDialog/FormikCirclePicker'
import { DEFAULT_DYNAMIC_VESSEL_GROUP } from '@features/VesselGroup/constants'
import {
  type CreateOrUpdateDynamicVesselGroup,
  CreateOrUpdateDynamicVesselGroupSchema,
  type DynamicVesselGroup
} from '@features/VesselGroup/types'
import { addOrUpdateVesselGroup } from '@features/VesselGroup/useCases/addOrUpdateVesselGroup'
import { countFilteredVessels } from '@features/VesselGroup/useCases/countFilteredVessels'
import { useGetFilterableZonesAsTreeOptions } from '@hooks/useGetFilterableZonesAsTreeOptions'
import { useGetGearsAsTreeOptions } from '@hooks/useGetGearsAsTreeOptions'
import { useGetOrganizationMembershipNamesAsOptions } from '@hooks/useGetOrganizationMembershipNamesAsOptions'
import { useGetPortsAsTreeOptions } from '@hooks/useGetPortsAsTreeOptions'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { useListenForDrawedGeometry } from '@hooks/useListenForDrawing'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import {
  Accent,
  Button,
  Checkbox,
  CheckPicker,
  Dialog,
  FormikDatePicker,
  FormikTextarea,
  FormikTextInput,
  MultiCascader,
  pluralize,
  Select,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { Formik, type FormikProps } from 'formik'
import { isEqual, uniq } from 'lodash-es'
import { type MutableRefObject, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import type { VesselListFilter, ZoneFilter } from '@features/Vessel/components/VesselList/types'
import type { MultiPolygon } from 'geojson'
import type { Promisable } from 'type-fest'

type ExportActivityReportsDialogProps = {
  editedVesselGroup?: DynamicVesselGroup
  initialListFilterValues: VesselListFilter
  onExit: () => Promisable<void>
}
export function EditDynamicVesselGroupDialog({
  editedVesselGroup = undefined,
  initialListFilterValues,
  onExit
}: ExportActivityReportsDialogProps) {
  const { newWindowContainerRef } = useNewWindow()
  const dispatch = useMainAppDispatch()
  const [listFilterValues, setListFilterValues] = useState<VesselListFilter>(initialListFilterValues)
  const [vesselsFound, setVesselsFound] = useState<number | undefined>(undefined)
  const formRef = useRef<FormikProps<CreateOrUpdateDynamicVesselGroup>>()

  const { fleetSegmentsAsOptions } = useGetFleetSegmentsAsOptions()
  const { gearsAsTreeOptions } = useGetGearsAsTreeOptions()
  const { portsAsTreeOptions } = useGetPortsAsTreeOptions()
  const { speciesAsOptions } = useGetSpeciesAsOptions()
  const filterableZoneAsTreeOptions = useGetFilterableZonesAsTreeOptions()
  const organizationMembershipNames = useGetOrganizationMembershipNamesAsOptions()

  const { drawedGeometry } = useListenForDrawedGeometry(InteractionListener.EDIT_DYNAMIC_VESSEL_GROUP_DIALOG)

  const updateListFilterValuesAndCountVessels = async (nextListFilterValues: VesselListFilter) => {
    setListFilterValues(nextListFilterValues)

    const nextVesselsFound = await dispatch(countFilteredVessels(nextListFilterValues))
    setVesselsFound(nextVesselsFound)
  }

  useEffect(() => {
    if (drawedGeometry) {
      const zones: ZoneFilter[] = listFilterValues.zones ?? []

      const previousZonesWithoutCustomZone = zones.filter(zone => zone.value !== 'custom')

      const nextZones = [
        ...previousZonesWithoutCustomZone,
        {
          feature: drawedGeometry as MultiPolygon,
          label: 'Zone de filtre manuelle',
          value: 'custom' // TODO Rename to LayerType.CUSTOM
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

  const updateLastControlPeriod = async (nextLastControlPeriod: LastControlPeriod | undefined) => {
    const nextListFilterValues = { ...listFilterValues, lastControlPeriod: nextLastControlPeriod }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateVesselSize = async (nextVesselSize: VesselSize | undefined) => {
    const nextListFilterValues = { ...listFilterValues, vesselSize: nextVesselSize }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const updateLastLandingPortLocodes = async (nextPortLocodes: string[] | undefined) => {
    const nextListFilterValues = { ...listFilterValues, lastLandingPortLocodes: nextPortLocodes ?? [] }
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

  const updateSpecyCodes = async (nextSpecyCodes: string[] | undefined) => {
    const normalizedNextSpecyCodes = nextSpecyCodes?.includes(BLUEFIN_TUNA_SPECY_CODE)
      ? uniq([...nextSpecyCodes, ...BLUEFIN_TUNA_EXTENDED_SPECY_CODES])
      : nextSpecyCodes

    const nextListFilterValues = { ...listFilterValues, specyCodes: normalizedNextSpecyCodes ?? [] }
    updateListFilterValuesAndCountVessels(nextListFilterValues)
  }

  const handleOnSubmit = async (values: CreateOrUpdateDynamicVesselGroup) => {
    const nextValues = { ...values, filters: listFilterValues }

    const isSuccess = await dispatch(addOrUpdateVesselGroup(nextValues))
    if (isSuccess) {
      onExit()
    }
  }

  return (
    <StyledDialog isAbsolute>
      <StyledDialogTitle>{editedVesselGroup ? 'Modifier' : 'Créer'} un groupe de navires dynamique</StyledDialogTitle>
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
            value={listFilterValues.lastLandingPortLocodes}
          />
          <Select
            isLabelHidden
            isTransparent
            label="Dernier contrôle"
            name="lastControlPeriod"
            onChange={updateLastControlPeriod}
            options={LAST_CONTROL_PERIODS_AS_OPTIONS}
            placeholder="Dernier contrôle"
            popupWidth={224}
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
          <MultiCascader
            disabled={!filterableZoneAsTreeOptions}
            isLabelHidden
            isTransparent
            label="Filtrer les navires avec une zone"
            name="zones"
            onChange={updateZones}
            options={filterableZoneAsTreeOptions ?? []}
            placeholder="Filtrer les navires avec une zone"
            popupWidth={500}
            renderValue={(_, items) => {
              const itemsChildrens = items.filter(
                item =>
                  (item.label === LayerProperties[MonitorFishMap.MonitorFishLayer.CUSTOM]?.name &&
                    item.parent === null) ||
                  item.parent !== null
              )

              return itemsChildrens.length > 0 ? (
                <SelectValue>Zone de filtre ({itemsChildrens.length})</SelectValue>
              ) : (
                <></>
              )
            }}
            searchable
            style={{ width: 416 }}
            uncheckableItemValues={['1', '2']}
            value={listFilterValues.zones?.map(zone => zone.value)}
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
          <Checkbox checked={isAtSea} label="En mer" name="always" onChange={updateVesselLocationAtSea} />
          <Checkbox checked={isAtPort} label="À quai" name="always" onChange={updateVesselLocationAtPort} />
        </Row>
        <StyledFilterTags
          listFilterValues={listFilterValues}
          onFilter={nextListFilterValues => updateListFilterValuesAndCountVessels(nextListFilterValues)}
          onReset={() => updateListFilterValuesAndCountVessels(DEFAULT_VESSEL_LIST_FILTER_VALUES)}
        />
        <Formik
          initialValues={editedVesselGroup ?? DEFAULT_DYNAMIC_VESSEL_GROUP}
          innerRef={formRef as MutableRefObject<FormikProps<CreateOrUpdateDynamicVesselGroup>>}
          onSubmit={handleOnSubmit}
          validationSchema={toFormikValidationSchema(CreateOrUpdateDynamicVesselGroupSchema)}
        >
          <Columns>
            <Column>
              <FormikCirclePicker />
              <StyledFormikTextInput isErrorMessageHidden isRequired label="Nom du groupe" name="name" />
              <StyledFormikTextarea isErrorMessageHidden label="Description du groupe" name="description" rows={3} />
            </Column>
            <Column $width={304}>
              <StyledFormikDatePicker
                baseContainer={newWindowContainerRef.current}
                isErrorMessageHidden
                isHistorical={false}
                isStringDate
                label="Date de fin de validité du groupe"
                name="endOfValidityUtc"
                style={{ width: 220 }}
              />
              <StyledFormikTextarea $isRed label="Points d'attention" name="pointsOfAttention" rows={3} />
            </Column>
          </Columns>
        </Formik>
      </StyledDialogBody>
      <StyledDialogAction>
        <Button accent={Accent.PRIMARY} disabled={areFiltersEmpty} onClick={() => formRef.current?.handleSubmit()}>
          {String(`${editedVesselGroup ? 'Modifier' : 'Créer'} le groupe`)}
        </Button>
        <Button accent={Accent.TERTIARY} onClick={onExit}>
          Annuler
        </Button>
      </StyledDialogAction>
    </StyledDialog>
  )
}

const StyledFilterTags = styled(FilterTags)`
  margin-right: 16px;
  margin-bottom: 16px;
`

const StyledFormikTextInput = styled(FormikTextInput)`
  margin-top: 16px;
`

const StyledFormikTextarea = styled(FormikTextarea)<{
  $isRed?: boolean
}>`
  label {
    ${p => p.$isRed && `color: ${p.theme.color.maximumRed};`}
  }

  textarea {
    ${p => p.$isRed && `background-color: ${p.theme.color.maximumRed15};`}

    &:active, &:hover, &:focus {
      ${p => p.$isRed && `background-color: ${p.theme.color.maximumRed15};`}
    }
  }
  margin-top: 16px;
`

const StyledFormikDatePicker = styled(FormikDatePicker)`
  margin-top: 64px;
  margin-bottom: 2px;
  text-align: left;
`

const Column = styled.div<{
  $width?: number
}>`
  margin-right: 24px;

  ${p => {
    if (p.$width) {
      return `width: ${p.$width}px`
    }

    return 'flex-grow: 1;'
  }}
`

const Columns = styled.div`
  display: flex;
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

  > .Element-Field:not(:nth-child(5)):not(:nth-child(9)) {
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
