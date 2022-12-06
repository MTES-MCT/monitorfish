import { Accent, Button, Icon, IconButton, Select } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { assoc, remove, update } from 'ramda'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { EMPTY_UNIT } from './constants'

import type { MissionUnit } from '../../../../domain/types/mission'

export type MultiUnitPickerProps = {
  name: string
}
export function MultiUnitPicker({ name }: MultiUnitPickerProps) {
  const [input, , helpers] = useField<Partial<MissionUnit>[] | undefined>(name)

  const currentUnits = useMemo(() => input.value || [], [input.value])

  const { setValue } = helpers

  const addUnit = useCallback(() => {
    const nextUnits = [...currentUnits, EMPTY_UNIT]

    setValue(nextUnits)
  }, [currentUnits, setValue])

  const deleteUnit = useCallback(
    (index: number) => {
      const nextUnits = remove(index, 1, currentUnits)

      setValue(nextUnits)
    },
    [currentUnits, setValue]
  )

  const handleChange = useCallback(
    (index: number, property: keyof MissionUnit, nextValue: string | undefined) => {
      const nextUnits = update(index, assoc(property, nextValue) as any, currentUnits)

      setValue(nextUnits)
    },
    [currentUnits, setValue]
  )

  return (
    <>
      <>
        {currentUnits.map((currentUnit, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Row key={`unit${index}`}>
            <UnitWrapper>
              <Select
                defaultValue={currentUnit.administrationId}
                label={`Administration ${index + 1}`}
                name={`administrationId_${index}`}
                onChange={nextValue => handleChange(index, 'administrationId', nextValue)}
                options={[]}
              />
              <Select
                defaultValue={currentUnit.unitId}
                disabled={!currentUnit.administrationId}
                label={`Unité ${index + 1}`}
                name={`unitId_${index}`}
                onChange={nextValue => handleChange(index, 'unitId', nextValue)}
                options={[]}
              />
              <Select
                defaultValue={currentUnit.meanId}
                disabled={!currentUnit.unitId}
                label={`Moyen ${index + 1}`}
                name={`meanId_${index}`}
                onChange={nextValue => handleChange(index, 'meanId', nextValue)}
                options={[]}
              />
              <Select
                defaultValue={currentUnit.contactId}
                disabled={!currentUnit.meanId}
                label={`Contact de l’unité ${index + 1}`}
                name={`contactId_${index}`}
                onChange={nextValue => handleChange(index, 'contactId', nextValue)}
                options={[]}
              />
            </UnitWrapper>

            <IconButton
              accent={Accent.SECONDARY}
              Icon={Icon.Delete}
              onClick={() => deleteUnit(index)}
              style={
                index === 0
                  ? {
                      visibility: 'hidden'
                    }
                  : undefined
              }
            />
          </Row>
        ))}
      </>

      <Button accent={Accent.SECONDARY} onClick={addUnit}>
        Ajouter une autre unité
      </Button>
    </>
  )
}

const Row = styled.div`
  align-items: flex-start;
  display: flex;

  > button {
    margin: 27px 0 0 0.5rem;
  }
`

const UnitWrapper = styled.div`
  flex-grow: 1;

  > div:not(:first-child) {
    margin-top: 0.5rem;
  }
`
