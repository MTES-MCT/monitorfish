import { Accent, Button, Checkbox, Fieldset, Icon, IconButton, Label, NotificationEvent } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { boundingExtent } from 'ol/extent'
import { transformExtent } from 'ol/proj'
import { remove } from 'ramda'
import { useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { missionActions } from '../../../../domain/actions'
import {
  InteractionListener,
  OPENLAYERS_PROJECTION,
  OpenLayersGeometryType,
  WSG84_PROJECTION
} from '../../../../domain/entities/map/constants'
import { fitToExtent } from '../../../../domain/shared_slices/Map'
import { addOrEditMissionZone } from '../../../../domain/use_cases/mission/addOrEditMissionZone'
import { useListenForDrawedGeometry } from '../../../../hooks/useListenForDrawing'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { useGetMainFormFormikUsecases } from '../hooks/useGetMainFormFormikUsecases'

import type { MissionMainFormValues } from '../types'
import type { Coordinate } from 'ol/coordinate'

export function FormikLocationPicker() {
  const { setFieldValue, values } = useFormikContext<MissionMainFormValues>()
  const geometryComputedFromControls = useMainAppSelector(store => store.mission.geometryComputedFromControls)

  const { drawedGeometry } = useListenForDrawedGeometry(InteractionListener.MISSION_ZONE)
  const { updateMissionLocation } = useGetMainFormFormikUsecases()
  const dispatch = useMainAppDispatch()

  const polygons = useMemo(() => {
    if (!values.geom) {
      return []
    }

    return values.geom.coordinates || []
  }, [values.geom])

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
      if (drawedGeometry?.type === OpenLayersGeometryType.MULTIPOLYGON) {
        setFieldValue('geom', drawedGeometry)
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
      if (!geometryComputedFromControls) {
        return
      }

      setFieldValue('geom', geometryComputedFromControls)

      window.document.dispatchEvent(
        new NotificationEvent('Une zone de mission a été ajoutée à partir des contrôles de la mission', 'success', true)
      )

      dispatch(missionActions.unsetGeometryComputedFromControls())
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, geometryComputedFromControls]
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
        <Checkbox
          checked={values.isGeometryComputedFromControls}
          label="Zone de la mission calculée à partir des contrôles"
          name="isGeometryComputedFromControls"
          onChange={async isChecked => {
            setFieldValue('isGeometryComputedFromControls', isChecked)

            if (isChecked) {
              const isSuccess = await updateMissionLocation(isChecked)
              if (!isSuccess) {
                window.document.dispatchEvent(
                  new NotificationEvent(
                    'Aucune zone ajoutée. La zone de mission est calculée à partir du dernier contrôle ajouté.',
                    'warning',
                    true
                  )
                )
              }
            }
          }}
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
