import { useGetGearsQuery } from '@api/gear'
import { GearMeshSizeEqualityComparator, gearMeshSizeOptions } from '@features/Alert/constants'
import { type EditedAlertSpecification, type GearSpecification } from '@features/Alert/types'
import { Tag } from '@features/Regulation/components/RegulationForm/Tag'
import { GEARS_CATEGORIES_WITH_MESH } from '@features/Regulation/utils'
import { useGetGearsAsTreeOptions } from '@hooks/useGetGearsAsTreeOptions'
import { FormikSelect, Label, MultiCascader, TextInput, THEME } from '@mtes-mct/monitor-ui'
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

  const sortedGears = [...values.gears].sort((a, b) => {
    const gearRefA = gearsReferential?.find(g => g.code === a.gear)
    const gearRefB = gearsReferential?.find(g => g.code === b.gear)

    if (!gearRefA && !gearRefB) {
      return 0
    }
    if (!gearRefA) {
      return 1
    }
    if (!gearRefB) {
      return -1
    }

    const allowMeshA = GEARS_CATEGORIES_WITH_MESH.includes(gearRefA.category)
    const allowMeshB = GEARS_CATEGORIES_WITH_MESH.includes(gearRefB.category)

    if (allowMeshA === allowMeshB) {
      return 0
    }

    return allowMeshA ? -1 : 1
  })

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
          data-cy="alert-criteria-gear-on-board-selector"
          disabled={!gearsAsTreeOptions}
          label="Ajouter un engin"
          name="gearCodes"
          onChange={updateGearCodes}
          onSelect={selectGearCodes}
          options={gearsAsTreeOptions ?? []}
          placeholder="Sélectionner"
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Engins déclenchant l&apos;alerte ({items.length})</SelectValue> : <></>
          }
          searchable
          style={{ marginTop: '16px' }}
          value={values.gears.map(gear => gear.gear)}
        />
        {values.gears.length > 0 && (
          <GearsWrapper>
            {sortedGears.map((gear, index) => {
              const gearRefential = gearsReferential?.find(g => g.code === gear.gear)

              if (!gearRefential) {
                return null
              }
              const label = gearRefential?.name ?? ''
              const allowMesh = GEARS_CATEGORIES_WITH_MESH.includes(gearRefential?.category)

              return (
                <Wrapper key={gear.gear}>
                  <TagWrapper $withMaxWidth={allowMesh}>
                    <Tag
                      backGroundColor={THEME.color.lightGray}
                      onCloseIconClicked={() => deleteGear(index)}
                      tagValue={`${gear.gear} - ${label}`}
                    />
                  </TagWrapper>
                  {allowMesh && (
                    <MeshWrapper>
                      <Label data-cy="mesh-label">Maillage</Label>
                      <FormikSelect
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
                        min={0}
                        name={`gears.${index}.minMesh`}
                        onChange={(nextValue: string | undefined) => {
                          setFieldValue(`gears.${index}.minMesh`, nextValue === '' ? undefined : Number(nextValue))
                        }}
                        type="number"
                        value={gear.minMesh ? String(gear.minMesh) : ''}
                      />
                      {values.gears[index]?.meshType === GearMeshSizeEqualityComparator.BETWEEN && (
                        <>
                          et
                          <StyledTextInput
                            isLabelHidden
                            label="Maillage max"
                            name={`gears.${index}.maxMesh`}
                            onChange={(nextValue: string | undefined) => {
                              setFieldValue(`gears.${index}.maxMesh`, nextValue === '' ? undefined : Number(nextValue))
                            }}
                            type="number"
                            value={gear.maxMesh ? String(gear.maxMesh) : ''}
                          />
                        </>
                      )}
                      <Unit>mm</Unit>
                    </MeshWrapper>
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
`
const GearsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;
`
const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`
const MeshWrapper = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
`
const StyledTextInput = styled(TextInput)`
  width: 72px;
`

const TagWrapper = styled.div<{ $withMaxWidth: boolean }>`
  max-width: ${props => (props.$withMaxWidth ? '40%' : 'none')};
`
const Unit = styled.span`
  color: ${THEME.color.slateGray};
`
