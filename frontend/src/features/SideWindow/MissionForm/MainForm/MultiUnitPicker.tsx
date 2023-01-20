import { Accent, Button, Icon, IconButton, MultiSelect, Select } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { assoc, remove, update } from 'ramda'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { EMPTY_UNIT } from './constants'
import { useNewWindow } from '../../../../ui/NewWindow'

import type { ControlUnit } from '../../../../domain/types/mission'

export type MultiUnitPickerProps = {
  name: string
}
export function MultiUnitPicker({ name }: MultiUnitPickerProps) {
  const [input, , helpers] = useField<Partial<ControlUnit>[] | undefined>(name)

  const { newWindowContainerRef } = useNewWindow()

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
    (index: number, property: keyof ControlUnit, nextValue: string | string[] | undefined) => {
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
                baseContainer={newWindowContainerRef.current}
                defaultValue={currentUnit.administration}
                label={`Administration ${index + 1}`}
                name={`administration_${index}`}
                onChange={nextValue => handleChange(index, 'administration', nextValue)}
                options={[]}
              />
              <Select
                baseContainer={newWindowContainerRef.current}
                defaultValue={currentUnit.name}
                disabled={!currentUnit.administration}
                label={`Unité ${index + 1}`}
                name={`name_${index}`}
                onChange={nextValue => handleChange(index, 'name', nextValue)}
                options={[]}
              />
              <MultiSelect
                baseContainer={newWindowContainerRef.current}
                defaultValue={currentUnit.resources?.map(resource => resource.id.toString())}
                disabled={!currentUnit.name}
                label={`Ressource ${index + 1}`}
                name={`meanId_${index}`}
                onChange={nextValue => handleChange(index, 'resources', nextValue)}
                options={[]}
              />
              <Select
                baseContainer={newWindowContainerRef.current}
                defaultValue={currentUnit.contact}
                disabled={!currentUnit.name}
                label={`Contact de l’unité ${index + 1}`}
                name={`contact_${index}`}
                onChange={nextValue => handleChange(index, 'contact', nextValue)}
                options={[]}
              />
            </UnitWrapper>

            <IconButton
              accent={Accent.SECONDARY}
              aria-label="Supprimer cette unité"
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
