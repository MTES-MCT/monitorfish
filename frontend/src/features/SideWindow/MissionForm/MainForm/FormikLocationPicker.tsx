import {
  Accent,
  Button,
  Fieldset,
  FormikCheckbox,
  Icon,
  IconButton,
  Label,
  NotificationEvent,
  usePrevious
} from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { boundingExtent } from 'ol/extent'
import { transformExtent } from 'ol/proj'
import { remove } from 'ramda'
import { useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { useGetPortsQuery } from '../../../../api/port'
import {
  InteractionListener,
  OPENLAYERS_PROJECTION,
  OpenLayersGeometryType,
  WSG84_PROJECTION
} from '../../../../domain/entities/map/constants'
import { fitToExtent } from '../../../../domain/shared_slices/Map'
import { MissionAction } from '../../../../domain/types/missionAction'
import { addOrEditMissionZone } from '../../../../domain/use_cases/mission/addOrEditMissionZone'
import { getLastControlCircleGeometry } from '../../../../domain/use_cases/mission/getLastControlCircleGeometry'
import { useDeepCompareEffect } from '../../../../hooks/useDeepCompareEffect'
import { useListenForDrawedGeometry } from '../../../../hooks/useListenForDrawing'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'

import type { MissionMainFormValues } from '../types'
import type { Coordinate } from 'ol/coordinate'

export function FormikLocationPicker() {
  const { setFieldValue, values } = useFormikContext<MissionMainFormValues>()
  const draft = useMainAppSelector(store => store.mission.draft)
  const getPortsApiQuery = useGetPortsQuery()

  const { geometry } = useListenForDrawedGeometry(InteractionListener.MISSION_ZONE)
  const dispatch = useMainAppDispatch()

  const polygons = useMemo(() => {
    if (!values.geom) {
      return []
    }

    return values.geom.coordinates || []
  }, [values.geom])

  const landControlsPorts = useMemo(
    () =>
      draft?.actionsFormValues
        ?.filter(action => action.actionType === MissionAction.MissionActionType.LAND_CONTROL && action.portLocode)
        ?.map(action => action.portLocode)
        ?.toString() || '',
    [draft?.actionsFormValues]
  )
  const previousControlPorts = usePrevious(landControlsPorts)

  const airOrSeaControlsCoordinates =
    useMemo(
      () =>
        draft?.actionsFormValues
          ?.filter(
            action =>
              (action.actionType === MissionAction.MissionActionType.AIR_CONTROL ||
                action.actionType === MissionAction.MissionActionType.SEA_CONTROL) &&
              action.latitude &&
              action.longitude
          )
          ?.map(action => `${action.latitude}/${action.longitude}`)
          ?.toString() || '',
      [draft?.actionsFormValues]
    ) || []
  const previousAirOrSeaControlsCoordinates = usePrevious(airOrSeaControlsCoordinates)

  const previousIsGeometryComputedFromControls = usePrevious(values.isGeometryComputedFromControls)

  /**
   * Update of the mission zone from air, sea or land controls
   */
  useDeepCompareEffect(() => {
    /**
     * If we newly select the isGeometryComputedFromControls button (it was disabled before),
     * we must update mission location
     */
    if (!previousIsGeometryComputedFromControls && values.isGeometryComputedFromControls) {
      updateMissionLocation()

      return
    }

    /**
     * If the isGeometryComputedFromControls was already selected,
     * we must update mission location if the land controls port changed
     */
    if (
      previousIsGeometryComputedFromControls &&
      values.isGeometryComputedFromControls &&
      previousControlPorts !== landControlsPorts
    ) {
      updateMissionLocation()

      return
    }

    /**
     * If the isGeometryComputedFromControls was already selected,
     * we must update mission location if the air or sea controls coordinates changed
     */
    if (
      previousIsGeometryComputedFromControls &&
      values.isGeometryComputedFromControls &&
      previousAirOrSeaControlsCoordinates !== airOrSeaControlsCoordinates
    ) {
      updateMissionLocation()
    }
  }, [values.isGeometryComputedFromControls, landControlsPorts, airOrSeaControlsCoordinates])

  const updateMissionLocation = useDebouncedCallback(async () => {
    if (!draft?.actionsFormValues || !getPortsApiQuery.data) {
      return
    }

    const nextMissionGeometry = await dispatch(
      getLastControlCircleGeometry(getPortsApiQuery.data, draft.actionsFormValues)
    )
    if (!nextMissionGeometry) {
      return
    }

    setFieldValue('geom', nextMissionGeometry)

    window.document.dispatchEvent(
      new NotificationEvent('Une zone de mission a été ajoutée à partir des contrôles de la mission', 'success', true)
    )
  }, 250)

  const addOrEditZone = useCallback(async () => {
    dispatch(addOrEditMissionZone(values.geom))
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
      if (!extent) {
        return
      }

      dispatch(fitToExtent(extent))
    },
    [dispatch]
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
    <StyledFieldSet data-cy="mission-main-form-location">
      <Label>Localisations</Label>

      <div>
        <Button
          accent={Accent.SECONDARY}
          disabled={values.isGeometryComputedFromControls}
          Icon={Icon.Plus}
          isFullWidth
          onClick={addOrEditZone}
        >
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

              <IconButton
                accent={Accent.SECONDARY}
                disabled={values.isGeometryComputedFromControls}
                Icon={Icon.Edit}
                onClick={addOrEditZone}
              />
              <IconButton
                accent={Accent.SECONDARY}
                aria-label="Supprimer cette zone"
                disabled={values.isGeometryComputedFromControls}
                Icon={Icon.Delete}
                onClick={() => deleteZone(index)}
              />
            </Row>
          ))}
        </>
        <FormikCheckbox
          label="Zone de la mission calculée à partir des contrôles"
          name="isGeometryComputedFromControls"
        />
      </div>
    </StyledFieldSet>
  )
}

const StyledFieldSet = styled(Fieldset)`
  .Field-Checkbox {
    margin-top: 8px;
  }
`

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
