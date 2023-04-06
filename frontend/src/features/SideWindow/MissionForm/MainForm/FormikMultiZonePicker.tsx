import { Accent, Button, Fieldset, Icon, IconButton, Label } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { boundingExtent } from 'ol/extent'
import { transformExtent } from 'ol/proj'
import { remove } from 'ramda'
import { useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import {
  InteractionListener,
  OpenLayersGeometryType,
  OPENLAYERS_PROJECTION,
  WSG84_PROJECTION
} from '../../../../domain/entities/map/constants'
import { fitToExtent } from '../../../../domain/shared_slices/Map'
import { addMissionZone } from '../../../../domain/use_cases/missions/addMissionZone'
import { useListenForDrawedGeometry } from '../../../../hooks/useListenForDrawing'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'

import type { MissionFormValues } from '../types'
import type { Coordinate } from 'ol/coordinate'

export type FormikMultiZonePickerProps = {
  name: string
}
export function FormikMultiZonePicker({ name }: FormikMultiZonePickerProps) {
  // TODO Type that.
  const [{ value }, , helpers] = useField<MissionFormValues['geom']>(name)

  const dispatch = useMainAppDispatch()
  const { geometry } = useListenForDrawedGeometry(InteractionListener.MISSION_ZONE)

  const polygons = useMemo(() => {
    if (!value) {
      return []
    }

    return value.coordinates || []
  }, [value])

  useEffect(
    () => {
      if (geometry?.type === OpenLayersGeometryType.MULTIPOLYGON) {
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

  const addZone = useCallback(async () => {
    dispatch(addMissionZone(value))
  }, [dispatch, value])

  const deleteZone = useCallback(
    (index: number) => {
      if (!value) {
        return
      }

      const nextCoordinates = remove(index, 1, value.coordinates)

      helpers.setValue({ ...value, coordinates: nextCoordinates })
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value]
  )

  return (
    <Fieldset>
      <Label>Localisations</Label>
      <Button accent={Accent.SECONDARY} Icon={Icon.Plus} isFullWidth onClick={addZone}>
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
              <Link onClick={() => handleCenterOnMap(polygonCoordinates as Coordinate[][])}>
                <Icon.SelectRectangle />
                <span>Centrer sur la carte</span>
              </Link>
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
    </Fieldset>
  )
}

const Row = styled.div`
  align-items: center;
  display: flex;
  margin: 8px 0 0;

  > button {
    margin: 0 0 0 8px;
  }
`

const ZoneWrapper = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-grow: 1;
  font-size: 13px;
  line-height: 1.3077; // = 17px
  justify-content: space-between;
  padding: 6px 12px 6px;
`

const Link = styled.a`
  align-items: center;
  color: ${p => p.theme.color.slateGray};
  cursor: pointer;
  display: inline-flex;

  > span {
    line-height: 1;
    margin: -2px 0 0 8px;
  }
`
