import { addOrEditMissionZone } from '@features/Mission/useCases/addOrEditMissionZone'
import { useListenForDrawedGeometry } from '@hooks/useListenForDrawing'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Fieldset, Icon, IconButton, Label, NotificationEvent, THEME } from '@mtes-mct/monitor-ui'
import {
  InteractionListener,
  OPENLAYERS_PROJECTION,
  OpenLayersGeometryType,
  WSG84_PROJECTION
} from 'domain/entities/map/constants'
import { fitToExtent } from 'domain/shared_slices/Map'
import { useFormikContext } from 'formik'
import { boundingExtent } from 'ol/extent'
import { transformExtent } from 'ol/proj'
import { remove } from 'ramda'
import { useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { useGetMainFormFormikUsecases } from '../hooks/useGetMainFormFormikUsecases'
import { missionFormActions } from '../slice'

import type { MissionMainFormValues } from '../types'
import type { Coordinate } from 'ol/coordinate'

export function FormikLocationPicker() {
  const { setFieldValue, values } = useFormikContext<MissionMainFormValues>()
  const geometryComputedFromControls = useMainAppSelector(store => store.missionForm.geometryComputedFromControls)

  const { drawedGeometry } = useListenForDrawedGeometry(InteractionListener.MISSION_ZONE)
  const { updateMissionLocation } = useGetMainFormFormikUsecases()
  const dispatch = useMainAppDispatch()

  const polygons = useMemo(() => {
    if (!values.geom) {
      return []
    }

    return values.geom.coordinates || []
  }, [values.geom])

  const addZone = useCallback(async () => {
    dispatch(addOrEditMissionZone(undefined))
  }, [dispatch])

  const editZone = useCallback(async () => {
    dispatch(addOrEditMissionZone(values.geom))
  }, [dispatch, values.geom])

  const deleteZone = useCallback(
    async (index: number) => {
      if (!values.geom) {
        return
      }

      const nextCoordinates = remove(index, 1, values.geom.coordinates)

      setFieldValue('geom', { ...values.geom, coordinates: nextCoordinates })

      if (!nextCoordinates.length) {
        setFieldValue('isGeometryComputedFromControls', true)

        const isSuccess = await updateMissionLocation(true)
        if (!isSuccess) {
          window.document.dispatchEvent(
            new NotificationEvent(
              'Aucune zone ajoutée. La zone de mission sera calculée à partir du prochain contrôle ajouté.',
              'warning',
              true
            )
          )
        }
      }
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
      if (drawedGeometry?.type === OpenLayersGeometryType.MULTIPOLYGON) {
        setFieldValue('geom', drawedGeometry)
        setFieldValue('isGeometryComputedFromControls', false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drawedGeometry]
  )

  /**
   * We use `geometryComputedFromControls` to dispatch the mission geometry computed
   * in the control form as the Formik's <ActionForm/> can't access the context of Formik's <MainForm/>
   */
  useEffect(
    () => {
      if (!geometryComputedFromControls || !values.isGeometryComputedFromControls) {
        return
      }

      setFieldValue('geom', geometryComputedFromControls)

      if (geometryComputedFromControls.coordinates?.length) {
        window.document.dispatchEvent(
          new NotificationEvent(
            'Une zone de mission a été modifiée à partir des contrôles de la mission',
            'success',
            true
          )
        )
      }

      dispatch(missionFormActions.unsetGeometryComputedFromControls())
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, geometryComputedFromControls]
  )

  return (
    <StyledFieldSet data-cy="mission-main-form-location">
      <Label>Localisations</Label>
      <div>
        <Button accent={Accent.SECONDARY} Icon={Icon.Plus} isFullWidth onClick={addZone}>
          Ajouter une zone de mission manuelle
        </Button>
        {!values.isGeometryComputedFromControls &&
          polygons.map((polygonCoordinates, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Row key={`zone-${index}`}>
              <ZoneWrapper>
                {`Zone de mission ${index + 1}`}
                {/* TODO Add `Accent.LINK` accent in @mtes-mct/monitor-ui and use it here. */}
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <Link onClick={() => handleCenterOnMap(polygonCoordinates as Coordinate[][])}>
                  <Icon.SelectRectangle />
                  <span>Centrer sur la carte</span>
                </Link>
              </ZoneWrapper>

              <IconButton accent={Accent.SECONDARY} Icon={Icon.Edit} onClick={editZone} />
              <IconButton
                accent={Accent.SECONDARY}
                aria-label="Supprimer cette zone"
                Icon={Icon.Delete}
                onClick={() => deleteZone(index)}
              />
            </Row>
          ))}
        {values.isGeometryComputedFromControls && !!polygons.length && (
          <ZoneComputedFromActions>
            Actuellement, la zone de mission est <b>automatiquement calculée</b> selon le point ou la zone de la
            dernière action rapportée par l’unité.
          </ZoneComputedFromActions>
        )}
      </div>
    </StyledFieldSet>
  )
}

const ZoneComputedFromActions = styled.div`
  margin-top: 8px;
  color: ${THEME.color.blueYonder};
  background: ${THEME.color.blueYonder25};
  padding: 16px;
`

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
