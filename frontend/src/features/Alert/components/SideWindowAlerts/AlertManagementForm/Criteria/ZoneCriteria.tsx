import { Criteria } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/shared/Criteria'
import { mapZonesWithMetadata } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/utils'
import { AdministrativeAreaType } from '@features/Alert/constants'
import { useGetFilterableZonesAsTreeOptions } from '@hooks/useGetFilterableZonesAsTreeOptions'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { MultiCascader, type TreeOption, type OptionValueType } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useFormikContext } from 'formik'
import { groupBy } from 'lodash-es'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import type { EditedAlertSpecification, RegulatoryAreaSpecification } from '@features/Alert/types'

const FILTERED_ZONES = ['Zone manuelle', 'Zones Cormoran (NAMO-SA)', 'Zones pour situation VMS']

type ZoneCriteriaProps = {
  onDelete: () => void
}
export function ZoneCriteria({ onDelete }: ZoneCriteriaProps) {
  const { setFieldValue, values } = useFormikContext<EditedAlertSpecification>()
  const administrativeZones = values.administrativeAreas.filter(
    zone => zone.areaType === AdministrativeAreaType.EEZ_AREA || zone.areaType === AdministrativeAreaType.FAO_AREA
  )
  const [isCriteriaOpened, setIsCriteriaOpened] = useState(false)
  const filterableZoneAsTreeOptions = useGetFilterableZonesAsTreeOptions()
  const filteredZones = filterableZoneAsTreeOptions?.filter(zone => !FILTERED_ZONES.includes(zone.label)) ?? []

  const regulatoryLayerLawTypes = useMainAppSelector(state => state.regulation.regulatoryLayerLawTypes)

  const regulatoryOptions = useMemo(
    () =>
      regulatoryLayerLawTypes
        ? (Object.entries(regulatoryLayerLawTypes).map(([lawType, topics]) => ({
            children: Object.entries(topics).map(([topic, zones]) => ({
              children: zones.map(zone => ({
                label: zone.zone,
                value: { lawType, topic, zone: zone.zone }
              })),
              label: topic,
              value: { lawType, topic, zone: undefined }
            })),
            label: lawType,
            value: { lawType, topic: undefined, zone: undefined }
          })) as TreeOption<RegulatoryAreaSpecification>[])
        : [],
    [regulatoryLayerLawTypes]
  )

  const updateZones = async (nextZonesNames: OptionValueType[] | undefined) => {
    assertNotNullish(filterableZoneAsTreeOptions)

    if (nextZonesNames === undefined) {
      setFieldValue('administrativeAreas', [])

      return
    }

    const allZones = mapZonesWithMetadata(filterableZoneAsTreeOptions)

    const selectedZones = allZones.filter(zone => nextZonesNames.includes(zone.id as OptionValueType))
    const zonesByType = groupBy(selectedZones, 'areaType')

    const administrativeAreas = Object.entries(zonesByType).map(([areaType, zones]) => ({
      areas: zones.map(zone => zone.code),
      areaType: areaType as AdministrativeAreaType
    }))

    setFieldValue('administrativeAreas', administrativeAreas)
  }

  const updateRegulatoryAreas = (nextRegulationValues: OptionValueType[] | undefined) => {
    if (nextRegulationValues === undefined) {
      setFieldValue('regulatoryAreas', [])

      return
    }

    setFieldValue('regulatoryAreas', nextRegulationValues as RegulatoryAreaSpecification[])
  }

  const handleDeleteCriteria = () => {
    setFieldValue('administrativeAreas', [])
    setFieldValue('regulatoryAreas', [])
    onDelete()
  }

  return (
    <Criteria.Wrapper>
      <Criteria.Head
        onClick={() => {
          setIsCriteriaOpened(!isCriteriaOpened)
        }}
        type="button"
      >
        <Criteria.Title>ZONES (VMS)</Criteria.Title>
        <Criteria.ChevronIcon $isOpen={isCriteriaOpened} />
      </Criteria.Head>
      <Criteria.Body $isOpen={isCriteriaOpened}>
        <Criteria.Info>
          Ce critère sert à détecter les navires émettant VMS dans une zone donnée. Pour détecter des navires déclarant
          des captures dans une zone donnée, spécifier une zone du FAR dans le critère &quot;espèces à bord&quot;.
        </Criteria.Info>
        <StyledMultiCascader
          disabled={!filterableZoneAsTreeOptions}
          label="Zones administratives déclenchant l'alerte"
          name="zones"
          onChange={updateZones}
          options={filteredZones}
          placeholder=""
          popupWidth={600}
          searchable
          uncheckableItemValues={['0', '1']}
          value={(() => {
            const allZones = mapZonesWithMetadata(filteredZones)

            return administrativeZones.flatMap(adminZone =>
              allZones
                .filter(zone => zone.areaType === adminZone.areaType && adminZone.areas.includes(zone.code))
                .map(zone => zone.id)
            )
          })()}
        />
        <StyledMultiCascader
          disabled={!regulatoryLayerLawTypes}
          label="Zones réglementaires déclenchant l'alerte"
          name="regulatoryAreas"
          onChange={updateRegulatoryAreas}
          options={regulatoryOptions}
          placeholder=""
          popupWidth={600}
          searchable
          uncheckableItemValues={['0', '1', '2', '3']}
          value={values.regulatoryAreas || []}
        />
        <Criteria.Delete onClick={handleDeleteCriteria} />
      </Criteria.Body>
    </Criteria.Wrapper>
  )
}

const StyledMultiCascader = styled(MultiCascader)`
  margin-top: 16px;
`
