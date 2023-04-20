import { Accent, Button, Fieldset, Icon, IconButton, Label, Select, type Option } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { boundingExtent } from 'ol/extent'
import { transformExtent } from 'ol/proj'
import { remove } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { useGetPortsQuery } from '../../../../api/port'
import {
  InteractionListener,
  OPENLAYERS_PROJECTION,
  OpenLayersGeometryType,
  WSG84_PROJECTION
} from '../../../../domain/entities/map/constants'
import { fitToExtent } from '../../../../domain/shared_slices/Map'
import { addMissionZone } from '../../../../domain/use_cases/missions/addMissionZone'
import { useListenForDrawedGeometry } from '../../../../hooks/useListenForDrawing'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { FrontendError } from '../../../../libs/FrontendError'
import { useNewWindow } from '../../../../ui/NewWindow'

import type { Port } from '../../../../domain/types/port'
import type { MissionFormValues } from '../types'
import type { Coordinate } from 'ol/coordinate'

export function FormikLocationPicker() {
  const { setFieldValue, values } = useFormikContext<MissionFormValues>()

  const { newWindowContainerRef } = useNewWindow()

  const [selectedDummyPort, setSelectedDummyPort] = useState<Port.Port | undefined>(undefined)

  const getPortsApiQuery = useGetPortsQuery()
  const { geometry } = useListenForDrawedGeometry(InteractionListener.MISSION_ZONE)
  const dispatch = useMainAppDispatch()

  const portsAsOptions: Option[] = useMemo(() => {
    if (!getPortsApiQuery.data) {
      return []
    }

    return getPortsApiQuery.data.map(({ locode, name }) => ({
      label: `${name} (${locode})`,
      value: locode
    }))
  }, [getPortsApiQuery.data])

  const polygons = useMemo(() => {
    if (!values.geom) {
      return []
    }

    return values.geom.coordinates || []
  }, [values.geom])

  const addZone = useCallback(async () => {
    dispatch(addMissionZone(values.geom))
  }, [dispatch, values.geom])

  const deleteZone = useCallback(
    (index: number) => {
      if (!values.geom) {
        return
      }

      const nextCoordinates = remove(index, 1, values.geom.coordinates)

      setFieldValue('geom', { ...values.geom, coordinates: nextCoordinates })
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values.geom]
  )

  const handleCenterOnMap = useCallback(
    (coordinates: Coordinate[][]) => {
      const firstRing = coordinates[0]
      if (!firstRing) {
        return
      }

      const extent = transformExtent(boundingExtent(firstRing), WSG84_PROJECTION, OPENLAYERS_PROJECTION)

      dispatch(fitToExtent(extent))
    },
    [dispatch]
  )

  const handlePortChange = useCallback(
    (nextPortLocode: string | undefined) => {
      if (!getPortsApiQuery.data) {
        return
      }

      if (!nextPortLocode) {
        // setFieldValue('portLocode', undefined)
        // setFieldValue('portName', undefined)

        setSelectedDummyPort(undefined)

        return
      }

      const port = getPortsApiQuery.data.find(({ locode }) => locode === nextPortLocode)
      if (!port) {
        throw new FrontendError('`port` is undefined')
      }

      // TODO We'll have to replace that with the port geometry.
      setFieldValue('geom', undefined)
      // setFieldValue('portLocode', port.locode)
      // setFieldValue('portLocode', port.locode)

      setSelectedDummyPort(port)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getPortsApiQuery.data]
  )

  useEffect(
    () => {
      if (geometry?.type === OpenLayersGeometryType.MULTIPOLYGON) {
        setFieldValue('geom', geometry)
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [geometry]
  )

  return (
    <Fieldset>
      <Label>Localisations</Label>

      <div>
        <Button accent={Accent.SECONDARY} disabled={!!selectedDummyPort} Icon={Icon.Plus} isFullWidth onClick={addZone}>
          Ajouter une zone de mission
        </Button>

        <>
          {polygons.map((polygonCoordinates, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Row key={`zone-${index}`}>
              <ZoneWrapper>
                Polygone dessiné {index + 1}
                {/* TODO Add `Accent.LINK` accent in @mtes-mct/monitor-ui and use it here. */}
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
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
      </div>

      <div>
        <StyledSelect
          baseContainer={newWindowContainerRef.current}
          isLabelHidden
          isLight
          label="Lieu du contrôle"
          name="port"
          onChange={handlePortChange}
          options={portsAsOptions}
          placeholder="ou sélectionnez un port"
          searchable
          // value={values.portLocode}
          value={selectedDummyPort?.locode}
          virtualized
        />
      </div>
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

const StyledSelect = styled(Select<string>)`
  margin-top: 12px;
`
