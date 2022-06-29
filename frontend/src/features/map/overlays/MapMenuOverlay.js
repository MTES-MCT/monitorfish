import React, { createRef, useCallback, useEffect, useRef, useState } from 'react'
import Overlay from 'ol/Overlay'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../../icons/Chevron_simple_gris.svg'
import {
  getTrackRequestFromTrackDepth,
  VesselTrackDepth
} from '../../../domain/entities/vesselTrackDepth'
import TrackRangeModal from './map_menu/TrackRangeModal'
import { useDispatch } from 'react-redux'
import showVesselTrack from '../../../domain/use_cases/vessel/showVesselTrack'
import { addVesselToFavorites } from '../../../domain/shared_slices/FavoriteVessel'
import { useClickOutsideWhenOpened } from '../../../hooks/useClickOutsideWhenOpened'

const MapMenuOverlay = props => {
  const {
    map,
    coordinates,
    vessel
  } = props

  const dispatch = useDispatch()

  const ref = createRef()
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const clickedOutsideComponent = useClickOutsideWhenOpened(ref, modalIsOpen)
  const [showTrackDepthSubMenu, setShowTrackDepthSubMenu] = useState(false)
  const [iShowed, setIsShowed] = useState(false)
  /** @type {[string, *]} */
  const [selectedTrackDepth, setsSelectedTrackDepth] = useState()
  /** @type {[[Date, Date], *]} */
  const [selectedDates, setSelectedDates] = useState()
  const overlayRef = useRef(null)

  const getOverlay = useCallback(() => {
    if (overlayRef.current === null) {
      overlayRef.current = new Overlay({
        element: ref.current,
        position: coordinates,
        autoPan: false,
        positioning: 'left-center',
        className: 'ol-overlay-container ol-selectable menu-overlay'
      })
    }

    return overlayRef.current
  }, [])

  /**
   * @param {[Date, Date]} dateRange
   */
  const updateDateRange = useCallback(([startDate, endDate]) => {
    const trackRequest = {
      trackDepth: VesselTrackDepth.CUSTOM,
      afterDateTime: startDate,
      beforeDateTime: endDate
    }

    dispatch(showVesselTrack(vessel.vesselProperties, false, trackRequest))

    map.removeOverlay(getOverlay())
    setIsShowed(false)
    setsSelectedTrackDepth(undefined)
    setSelectedDates([startDate, endDate])
  }, [])

  useEffect(() => {
    if (clickedOutsideComponent) {
      map.removeOverlay(getOverlay())
    }
  }, [clickedOutsideComponent])

  useEffect(() => {
    if (!selectedTrackDepth) {
      return
    }

    const trackRequest = getTrackRequestFromTrackDepth(selectedTrackDepth)

    dispatch(showVesselTrack(vessel.vesselProperties, false, trackRequest))

    map.removeOverlay(getOverlay())
    setIsShowed(false)
    setsSelectedTrackDepth(undefined)
    setSelectedDates(undefined)
  }, [selectedTrackDepth])

  useEffect(() => {
    if (map && coordinates?.length) {
      getOverlay().setPosition(coordinates)
      getOverlay().setElement(ref.current)
      setShowTrackDepthSubMenu(false)
      ref.current.parentNode.className = 'ol-overlay-container ol-selectable menu-overlay'

      setIsShowed(true)
      map.addOverlay(getOverlay())

      return () => {
        map.removeOverlay(getOverlay())
        setIsShowed(false)
        setsSelectedTrackDepth(undefined)
        setSelectedDates([])
      }
    }
  }, [coordinates, map])

  return (
    <WrapperToBeKeptForDOMManagement ref={ref}>
      <div ref={ref}>
        {
          iShowed
            ? <>
              <Wrapper>
                <div>
                  {
                    vessel
                      ? <>
                        <FirstColumnMenu>
                          <Menu
                            data-cy={'show-vessel-tracks-menu-options'}
                            onMouseEnter={() => setShowTrackDepthSubMenu(true)}
                          >
                            Afficher la piste VMS depuis…
                            <ChevronIcon/>
                          </Menu>
                        </FirstColumnMenu>
                        <FirstColumnMenu>
                          <Menu
                            data-cy={'add-vessel-to-favorites'}
                            onMouseEnter={() => setShowTrackDepthSubMenu(false)}
                            onClick={() => dispatch(addVesselToFavorites(vessel.vesselProperties)) && setIsShowed(false)}
                          >
                            Ajouter le navire aux navires suivis
                          </Menu>
                        </FirstColumnMenu>
                      </>
                      : null
                  }
                </div>
                {
                  showTrackDepthSubMenu
                    ? <SecondColumnMenu>
                      {
                        vessel
                          ? <>
                            <Menu second onClick={() => setsSelectedTrackDepth(VesselTrackDepth.LAST_DEPARTURE)}>dernier DEP</Menu>
                            <Menu second onClick={() => setsSelectedTrackDepth(VesselTrackDepth.TWELVE_HOURS)}>12 heures</Menu>
                            <Menu second onClick={() => setsSelectedTrackDepth(VesselTrackDepth.ONE_DAY)}>24 heures</Menu>
                            <Menu second onClick={() => setsSelectedTrackDepth(VesselTrackDepth.TWO_DAYS)}>2 jours</Menu>
                            <Menu second data-cy={'show-vessel-tracks-three-days'} onClick={() => setsSelectedTrackDepth(VesselTrackDepth.THREE_DAYS)}>3 jours</Menu>
                            <Menu second onClick={() => setsSelectedTrackDepth(VesselTrackDepth.ONE_WEEK)}>1 semaine</Menu>
                            <Menu second onClick={() => setsSelectedTrackDepth(VesselTrackDepth.TWO_WEEK)}>2 semaines</Menu>
                            <Menu second onClick={() => setsSelectedTrackDepth(VesselTrackDepth.ONE_MONTH)}>1 mois</Menu>
                            <Menu
                              withTopLine
                              second
                              onClick={() => setModalIsOpen(true)}
                              data-cy={'show-vessel-tracks-custom-period'}
                            >
                              Choisir une période précise
                            </Menu>
                          </>
                          : null
                      }
                    </SecondColumnMenu>
                    : null
                }
              </Wrapper>
              <TrackRangeModal
                isModalOpen={modalIsOpen}
                setModalIsOpen={setModalIsOpen}
                selectedDates={selectedDates}
                setSelectedDates={updateDateRange}
              />
            </>
            : null
        }
      </div>
    </WrapperToBeKeptForDOMManagement>
  )
}

const Wrapper = styled.div`
  font: normal normal normal 13px/18px Marianne;
  letter-spacing: 0px;
  text-align: left;
  color: ${COLORS.slateGray};
  display: flex;
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(90deg);
  width: 13px;
  margin-top: -3px;
  margin-right: 5px;
  margin-left: auto;
`

const FirstColumnMenu = styled.div`
  display: flex;
  width: 250px;
  box-shadow: 0px 2px 5px ${COLORS.overlayShadow};
  height: min-content;
  cursor: pointer;
`

const SecondColumnMenu = styled.div`
  margin-left: 2px;
  width: 200px;
  box-shadow: 0px 2px 5px ${COLORS.overlayShadow};
  cursor: pointer;
`

const Menu = styled.span`
  background: ${COLORS.background};
  padding: 5px ${props => props.second ? 15 : 0}px 0px 15px;
  height: 25px;
  display: inline-block;
  display: flex;
  width: 100%;
  border-top: ${props => props.withTopLine ? 1 : 0}px solid ${COLORS.lightGray};

  :hover {
    background: ${COLORS.gainsboro};
  }
`

const WrapperToBeKeptForDOMManagement = styled.div``

export default MapMenuOverlay
