import { Accent, Button, Field, Icon, IconButton, Label } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { boundingExtent } from 'ol/extent'
import { transformExtent } from 'ol/proj'
import { remove } from 'ramda'
import { useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import {
  InteractionListener,
  OLGeometryType,
  OPENLAYERS_PROJECTION,
  WSG84_PROJECTION
} from '../../../../domain/entities/map/constants'
import { fitToExtent } from '../../../../domain/shared_slices/Map'
import { addMissionZone } from '../../../../domain/use_cases/missions/addMissionZone'
import { useListenForDrawedGeometry } from '../../../../hooks/useListenForDrawing'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'

import type { MissionFormValues } from './types'
import type { Coordinate } from 'ol/coordinate'

export type FormikMultiZonePickerProps = {
  name: string
}
export function FormikMultiZonePicker({ name }: FormikMultiZonePickerProps) {
  // TODO Type that.
  const [input, , helpers] = useField<MissionFormValues['geom']>(name)

  const dispatch = useMainAppDispatch()
  const { geometry } = useListenForDrawedGeometry(InteractionListener.MISSION_ZONE)

  const polygons = useMemo(() => {
    if (!input.value) {
      return []
    }

    return input.value.coordinates || []
  }, [input.value])

  useEffect(
    () => {
      if (geometry?.type === OLGeometryType.MULTIPOLYGON) {
        helpers.setValue(geometry)
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [geometry]
  )

  const handleCenterOnMap = (coordinates: Coordinate[][]) => {
    const firstRing = coordinates[0]
    if (!firstRing) {
      return
    }

    const extent = transformExtent(boundingExtent(firstRing), WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    dispatch(fitToExtent(extent))
  }

  const addZone = useCallback(
    async () => {
      dispatch(addMissionZone(input.value))
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, input.value]
  )

  const deleteZone = useCallback(
    (index: number) => {
      if (!input.value) {
        return
      }

      const nextCoordinates = remove(index, 1, input.value.coordinates)

      helpers.setValue({ ...input.value, coordinates: nextCoordinates })
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  return (
    <Field>
      <Label>Localisations</Label>
      <Button accent={Accent.SECONDARY} Icon={Icon.Plus} onClick={addZone}>
        Ajouter une zone de mission
      </Button>

      <>
        {polygons.map((polygonCoordinates, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Row key={`zone-${index}`}>
            <ZoneWrapper>
              Polygone dessiné {index + 1}
              {/* TODO Add `Accent.LINK` accent in @mtes-mct/monitor-ui and use it here. */}
              {/* eslint-disable jsx-a11y/anchor-is-valid */}
              {/* eslint-disable jsx-a11y/click-events-have-key-events */}
              {/* eslint-disable jsx-a11y/no-static-element-interactions */}
              <Center onClick={() => handleCenterOnMap(polygonCoordinates as Coordinate[][])}>
                <Icon.SelectRectangle /> Centrer sur la carte
              </Center>
            </ZoneWrapper>

            <IconButton accent={Accent.SECONDARY} Icon={Icon.Edit} onClick={addZone} />
            <IconButton
              accent={Accent.SECONDARY}
              aria-label="Supprimer cette zone"
              Icon={Icon.Delete}
              onClick={() => deleteZone(index)}
            />
          </Row>
        ))}
      </>
    </Field>
  )
}

const Center = styled.a`
  cursor: pointer;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  margin: 0.5rem 0 0;

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
