import { getAdministrativeSubZonesFromAPI } from '@api/geoserver'
import { useGetSpeciesQuery } from '@api/specy'
import { LayerProperties } from '@features/Map/constants'
import { FieldsetGroupSpinner } from '@features/Mission/components/MissionForm/shared/FieldsetGroup'
import { Tag } from '@features/Regulation/components/RegulationForm/Tag'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { CustomSearch, TextInput, type Option, Select, MultiSelect, Level, THEME, Label } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Criteria } from '../shared/Criteria'

import type { EditedAlertSpecification } from '@features/Alert/types'
import type { Specy } from 'domain/types/specy'

type SpeciesOnBoardCriteriaProps = {
  onDelete: () => void
  speciesAsOptions: Option<Specy>[] | undefined
}

export function SpeciesOnBoardCriteria({ onDelete, speciesAsOptions }: SpeciesOnBoardCriteriaProps) {
  const dispatch = useMainAppDispatch()
  const [isCriteriaOpened, setIsCriteriaOpened] = useState(true)
  const { setFieldValue, values } = useFormikContext<EditedAlertSpecification>()
  const { data: speciesAndGroups } = useGetSpeciesQuery()

  const [administrativeZones, setAdministrativeZones] = useState<any | undefined>(undefined)

  useEffect(() => {
    let isMounted = true

    async function fetchZones() {
      try {
        const zones = await getAdministrativeSubZonesFromAPI(LayerProperties.FAO.code, false)
        const zoneNameKey = LayerProperties.FAO.zoneNamePropertyKey

        if (isMounted && zoneNameKey) {
          const zonesAsOptions = zones.features.map((zone: any) => ({
            label: zone.properties[zoneNameKey],
            value: zone.id
          }))
          setAdministrativeZones(zonesAsOptions)
        }
      } catch (error) {
        dispatch(
          addSideWindowBanner({
            children: 'Une erreur est survenue lors de la récupération des zones FAO',
            closingDelay: 5000,
            isClosable: true,
            level: Level.ERROR,
            withAutomaticClosing: true
          })
        )
      }
    }

    fetchZones()

    return () => {
      isMounted = false
    }
  }, [dispatch])

  const deleteCriteria = () => {
    setFieldValue('species', [])
    onDelete()
  }

  const customSearch = useMemo(
    () =>
      new CustomSearch(
        speciesAsOptions ?? [],
        [
          {
            name: 'value.code',
            weight: 0.9
          },
          {
            name: 'value.name',
            weight: 0.1
          }
        ],
        { cacheKey: 'ALERT_SPECIES_AS_OPTIONS', isStrict: true }
      ),
    [speciesAsOptions]
  )

  const addSpecy = (nextSpecy: Specy | undefined) => {
    if (!nextSpecy) {
      return
    }

    const isSpecyAlreadyInCriteria = values.species?.find(specy => specy.code === nextSpecy.code)
    if (isSpecyAlreadyInCriteria) {
      return
    }

    const newSpeciesList = [...(values.species ?? []), { code: nextSpecy.code, minWeight: undefined }]
    setFieldValue('species', newSpeciesList)
  }

  const deleteSpecy = (indexToDelete: number) => {
    const newSpeciesList = values.species?.filter((_, index) => index !== indexToDelete) ?? []
    setFieldValue('species', newSpeciesList)
  }

  if (!speciesAsOptions?.length || !customSearch || !administrativeZones) {
    return <FieldsetGroupSpinner isLight />
  }

  return (
    <Criteria.Wrapper>
      <Criteria.Head
        onClick={() => {
          setIsCriteriaOpened(!isCriteriaOpened)
        }}
        type="button"
      >
        <Criteria.Title>ESPÈCES À BORD</Criteria.Title>
        <Criteria.ChevronIcon $isOpen={isCriteriaOpened} />
      </Criteria.Head>
      <Criteria.Body $isOpen={isCriteriaOpened}>
        <Criteria.Info>
          Les espèces à bord sont déterminées à partir de tous les FAR de la marée en cours.Toutes les quantités sont à
          indiquer en poids vif.
        </Criteria.Info>
        <Select
          customSearch={customSearch}
          disabled={!speciesAsOptions}
          label="Espèce déclenchant l'alerte"
          name="species"
          onChange={addSpecy}
          options={speciesAsOptions ?? []}
          optionValueKey="code"
          searchable
          style={{ marginTop: '16px' }}
          virtualized
        />
        <SpeciesWrapper>
          {values.species?.map((specy, index) => {
            const specyLabel = speciesAndGroups?.species?.find(specyFromApi => specyFromApi.code === specy.code)?.name

            return (
              <Wrapper key={specy.code}>
                <TagWrapper>
                  <Tag
                    backGroundColor={THEME.color.lightGray}
                    onCloseIconClicked={() => deleteSpecy(index)}
                    tagValue={specyLabel ?? ''}
                  />
                </TagWrapper>
                <WeightWrapper>
                  <Label>Quantité supérieure à</Label>
                  <TextInput
                    isLabelHidden
                    label={`Quantité pour l'espèce ${specy.code}`}
                    name={`species[${index}].minWeight`}
                    onChange={(nextValue: string | undefined) => {
                      setFieldValue(`species.${index}.minWeight`, nextValue ? Number(nextValue) : undefined)
                    }}
                    style={{ width: '72px' }}
                    type="number"
                    value={specy.minWeight ? String(specy.minWeight) : ''}
                  />
                  <Unit>kg</Unit>
                </WeightWrapper>
              </Wrapper>
            )
          })}

          <MultiSelect
            label="Zones de capture (FAR)"
            name="speciesCatchAreas"
            onChange={selectedOptions => {
              setFieldValue('speciesCatchAreas', selectedOptions)
            }}
            options={administrativeZones || []}
            value={values?.speciesCatchAreas || []}
          />
        </SpeciesWrapper>
        <Criteria.Delete onClick={deleteCriteria} />
      </Criteria.Body>
    </Criteria.Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`
const SpeciesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;
`
const WeightWrapper = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
`

const TagWrapper = styled.div`
  max-width: 50%;
`
const Unit = styled.span`
  color: ${THEME.color.slateGray};
`
