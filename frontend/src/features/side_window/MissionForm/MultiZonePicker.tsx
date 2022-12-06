import { Accent, Button, Field, Icon, IconButton, Label } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { remove } from 'ramda'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

export type MultiZonePickerProps = {
  addButtonLabel: string
  defaultZoneLabel: string
  name: string
}
export function MultiZonePicker({ addButtonLabel, defaultZoneLabel, name }: MultiZonePickerProps) {
  const [input, , helpers] = useField<
    | Array<{
        label: string
      }>
    | undefined
  >(name)

  const currentZones = useMemo(() => input.value || [], [input.value])

  const { setValue } = helpers

  const addZone = useCallback(() => {
    const nextZones = [
      ...currentZones,
      {
        label: defaultZoneLabel
      }
    ]

    setValue(nextZones)
  }, [currentZones, defaultZoneLabel, setValue])

  const deleteZone = useCallback(
    (index: number) => {
      const nextZones = remove(index, 1, currentZones)

      setValue(nextZones)
    },
    [currentZones, setValue]
  )

  return (
    <Field>
      <Label>Localisations</Label>
      <Button accent={Accent.SECONDARY} Icon={Icon.Plus} onClick={addZone}>
        {addButtonLabel}
      </Button>

      <>
        {currentZones.map((currentZone, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Row key={`zone-${index}`}>
            <ZoneWrapper>
              {currentZone.label}

              {/* TODO Add `Accent.LINK` accent in @mtes-mct/monitor-ui and use it here. */}
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#">
                <Icon.SelectRectangle /> Centrer sur la carte
              </a>
            </ZoneWrapper>

            <IconButton accent={Accent.SECONDARY} Icon={Icon.Edit} />
            <IconButton accent={Accent.SECONDARY} Icon={Icon.Delete} onClick={() => deleteZone(index)} />
          </Row>
        ))}
      </>
    </Field>
  )
}

const Row = styled.div`
  align-items: center;
  display: flex;
  margin: 0.5rem 0 0 0;

  > button {
    margin: 0 0 0 0.5rem;
  }
`

const ZoneWrapper = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-grow: 1;
  font-size: 13px;
  justify-content: space-between;
  padding: 5px 0.75rem 4px;
`
