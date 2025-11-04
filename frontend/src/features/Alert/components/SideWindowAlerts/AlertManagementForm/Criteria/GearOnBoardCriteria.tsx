import { useGetGearsQuery } from '@api/gear'
import { GearMeshSizeEqualityComparator, gearMeshSizeOptions } from '@features/Alert/constants'
import { type EditedAlertSpecification, type GearSpecification } from '@features/Alert/types'
import { Tag } from '@features/Regulation/components/RegulationForm/Tag'
import { GEARS_CATEGORIES_WITH_MESH } from '@features/Regulation/utils'
import { useGetGearsAsTreeOptions } from '@hooks/useGetGearsAsTreeOptions'
import { FormikSelect, Label, MultiCascader, TextInput } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useState } from 'react'
import styled from 'styled-components'

import { Criteria } from '../shared/Criteria'

type GearOnBoardCriteriaProps = {
  onDelete: () => void
}

export function GearOnBoardCriteria({ onDelete }: GearOnBoardCriteriaProps) {
  const [isCriteriaOpened, setIsCriteriaOpened] = useState(true)
  const { setFieldValue, values } = useFormikContext<EditedAlertSpecification>()
  const { gearsAsTreeOptions } = useGetGearsAsTreeOptions()
  const { data: gearsReferential } = useGetGearsQuery()

  const deleteCriteria = () => {
    setFieldValue('gears', [])
    onDelete()
  }

  const updateGearCodes = (selectedGearCodes: string[] | undefined) => {
    const newGears: GearSpecification[] =
      selectedGearCodes?.map(gearCode => {
        const existingGear = values.gears.find(g => g.gear === gearCode)
        if (existingGear) {
          return existingGear
        }

        return {
          gear: gearCode,
          maxMesh: undefined,
          meshType: undefined,
          minMesh: undefined
        }
      }) ?? []
    setFieldValue('gears', newGears)
  }

  const selectGearCodes = (item: any, activePaths: any[]) => {
    if (activePaths.length !== 2) {
      return
    }

    const gearCode = item.optionValue
    const existingGear = values.gears.find(g => g.gear === gearCode)

    if (existingGear) {
      const newGears = values.gears.filter(gear => gear.gear !== gearCode)
      setFieldValue('gears', newGears)

      return
    }

    const newGear: GearSpecification = {
      gear: gearCode,
      maxMesh: undefined,
      meshType: undefined,
      minMesh: undefined
    }
    setFieldValue('gears', [...values.gears, newGear])
  }

  const deleteGear = (index: number) => {
    const newGears = values.gears.filter((_, i) => i !== index)
    setFieldValue('gears', newGears)
  }

  return (
    <Criteria.Wrapper>
      <Criteria.Head
        onClick={() => {
          setIsCriteriaOpened(!isCriteriaOpened)
        }}
        type="button"
      >
        <Criteria.Title>ENGINS À BORD</Criteria.Title>
        <Criteria.ChevronIcon $isOpen={isCriteriaOpened} />
      </Criteria.Head>
      <Criteria.Body $isOpen={isCriteriaOpened}>
        <Criteria.Info>
          Si le navire n&apos;a pas encore fait de FAR, ce sont ses engins récents (FAR des 14 derniers jours) qui
          seront utilisés.
        </Criteria.Info>
        <MultiCascader
          disabled={!gearsAsTreeOptions}
          label="Engins déclanchant l'alerte"
          name="gearCodes"
          onChange={updateGearCodes}
          onSelect={selectGearCodes}
          options={gearsAsTreeOptions ?? []}
          placeholder="Engins déclanchant l'alerte"
          popupWidth={500}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Engins déclanchant l&apos;alerte ({items.length})</SelectValue> : <></>
          }
          searchable
          style={{ marginTop: '16px' }}
          value={values.gears.map(gear => gear.gear)}
        />
        {values.gears.length > 0 && (
          <GearsWrapper>
            {values.gears.map((gear, index) => {
              const gearRefential = gearsReferential?.find(g => g.code === gear.gear)

              if (!gearRefential) {
                return null
              }
              const label = gearRefential?.name ?? ''
              const allowMesh = GEARS_CATEGORIES_WITH_MESH.includes(gearRefential?.category)

              return (
                <Wrapper key={gear.gear}>
                  <GearWrapper>
                    <Label>{`Engin ${index + 1}`}</Label>
                    <Tag
                      onCloseIconClicked={() => deleteGear(index)}
                      tagValue={`${label}${gear.gear ? ` (${gear.gear})` : ''}`}
                    />
                  </GearWrapper>
                  {allowMesh && (
                    <div>
                      <Label data-cy="mesh-label">Maillage</Label>
                      <MeshFieldsWrapper>
                        <FormikSelect
                          cleanable={false}
                          isLabelHidden
                          label="Type de maillage"
                          name={`gears.${index}.meshType`}
                          options={gearMeshSizeOptions}
                          searchable={false}
                          style={{ width: '170px' }}
                        />
                        <StyledTextInput
                          isLabelHidden
                          label="Maillage min"
                          name={`gears.${index}.minMesh`}
                          onChange={(nextValue: string | undefined) => {
                            setFieldValue(`gears.${index}.minMesh`, nextValue === '' ? undefined : Number(nextValue))
                          }}
                          type="number"
                          value={String(gear.minMesh) ?? ''}
                        />
                        {values.gears[index]?.meshType === GearMeshSizeEqualityComparator.BETWEEN && (
                          <>
                            et
                            <StyledTextInput
                              isLabelHidden
                              label="Maillage max"
                              name={`gears.${index}.maxMesh`}
                              onChange={(nextValue: string | undefined) => {
                                setFieldValue(
                                  `gears.${index}.maxMesh`,
                                  nextValue === '' ? undefined : Number(nextValue)
                                )
                              }}
                              type="number"
                              value={String(gear.maxMesh) ?? ''}
                            />
                          </>
                        )}
                        <span>mm</span>
                      </MeshFieldsWrapper>
                    </div>
                  )}
                </Wrapper>
              )
            })}
          </GearsWrapper>
        )}
        <Criteria.Delete onClick={deleteCriteria} />
      </Criteria.Body>
    </Criteria.Wrapper>
  )
}

const SelectValue = styled.span`
  display: flex;
  overflow: hidden;
  pointer-events: none;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const GearsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;
`
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
const GearWrapper = styled.div`
  align-self: start;
  display: flex;
  flex-direction: column;
`

const MeshFieldsWrapper = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
`
const StyledTextInput = styled(TextInput)`
  width: 64px;
`
