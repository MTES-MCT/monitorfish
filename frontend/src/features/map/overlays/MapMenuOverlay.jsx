import Overlay from 'ol/Overlay'
import { createRef, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import { TrackRangeModal } from './map_menu/TrackRangeModal'
import { COLORS } from '../../../constants/constants'
import { getTrackRequestFromTrackDepth, VesselTrackDepth } from '../../../domain/entities/vesselTrackDepth'
import { addVesselToFavorites } from '../../../domain/shared_slices/FavoriteVessel'
import { showVesselTrack } from '../../../domain/use_cases/vessel/showVesselTrack'
import { useClickOutsideWhenOpened } from '../../../hooks/useClickOutsideWhenOpened'
import ChevronIconSVG from '../../icons/Chevron_simple_gris.svg?react'
import { monitorfishMap } from '../monitorfishMap'

function MapMenuOverlay({ coordinates, vessel }) {
  const dispatch = useDispatch()

  const ref = createRef()
  /** @type {React.MutableRefObject<import('ol').Overlay | undefined>} */
  const overlayRef = useRef()
  const [isTrackRangeModalOpen, setIsTrackRangeModalOpen] = useState(false)
  const [showTrackDepthSubMenu, setShowTrackDepthSubMenu] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const clickedOutsideComponent = useClickOutsideWhenOpened(ref, isOpen)
  /** @type {[string | undefined, *]} */
  const [selectedTrackDepth, setSelectedTrackDepth] = useState()
  /** @type {[[Date, Date] | undefined, *]} */
  const [selectedDateRange, setSelectedDateRange] = useState()

  const getOverlay = useCallback(() => {
    if (!overlayRef.current) {
      overlayRef.current = new Overlay({
        autoPan: false,
        className: 'ol-overlay-container ol-selectable menu-overlay',
        element: ref.current,
        position: coordinates,
        positioning: 'left-center'
      })
    }

    return overlayRef.current
  }, [])

  /**
   * @param {[Date, Date]=} dateRange
   */
  const updateDateRange = useCallback(
    dateRange => {
      if (!dateRange) {
        setSelectedDateRange(undefined)

        return
      }

      const [startDate, endDate] = dateRange
      const trackRequest = {
        afterDateTime: startDate,
        beforeDateTime: endDate,
        trackDepth: VesselTrackDepth.CUSTOM
      }

      dispatch(showVesselTrack(vessel.vesselProperties, true, trackRequest))

      monitorfishMap.removeOverlay(getOverlay())
      setIsOpen(false)
      setSelectedDateRange(dateRange)
      setSelectedTrackDepth(undefined)
    },
    [vessel]
  )

  useEffect(() => {
    if (clickedOutsideComponent) {
      monitorfishMap.removeOverlay(getOverlay())
    }
  }, [clickedOutsideComponent])

  useEffect(() => {
    if (!selectedTrackDepth) {
      return
    }

    const trackRequest = getTrackRequestFromTrackDepth(selectedTrackDepth)

    dispatch(showVesselTrack(vessel.vesselProperties, true, trackRequest))

    monitorfishMap.removeOverlay(getOverlay())
    setIsOpen(false)
    setSelectedTrackDepth(undefined)
    setSelectedDateRange(undefined)
  }, [selectedTrackDepth])

  useEffect(() => {
    if (coordinates?.length) {
      const overlay = getOverlay()

      overlay.setPosition(coordinates)
      overlay.setElement(ref.current)
      setShowTrackDepthSubMenu(false)
      ref.current.parentNode.className = 'ol-overlay-container ol-selectable menu-overlay'

      setIsOpen(true)
      monitorfishMap.addOverlay(overlay)
    }

    return () => {
      monitorfishMap.removeOverlay(getOverlay())
      setIsOpen(false)
      setSelectedTrackDepth(undefined)
      setSelectedDateRange(undefined)
    }
  }, [coordinates])

  return (
    <WrapperToBeKeptForDOMManagement ref={ref}>
      <div ref={ref}>
        {isOpen ? (
          <>
            <Wrapper>
              <div>
                {vessel ? (
                  <>
                    <FirstColumnMenu>
                      <Menu
                        data-cy="show-vessel-tracks-menu-options"
                        onMouseEnter={() => setShowTrackDepthSubMenu(true)}
                      >
                        Afficher la piste VMS depuis…
                        <ChevronIcon />
                      </Menu>
                    </FirstColumnMenu>
                    <FirstColumnMenu>
                      <Menu
                        data-cy="add-vessel-to-favorites"
                        onClick={() => dispatch(addVesselToFavorites(vessel.vesselProperties)) && setIsOpen(false)}
                        onMouseEnter={() => setShowTrackDepthSubMenu(false)}
                      >
                        Ajouter le navire aux navires suivis
                      </Menu>
                    </FirstColumnMenu>
                  </>
                ) : null}
              </div>
              {showTrackDepthSubMenu ? (
                <SecondColumnMenu>
                  {vessel ? (
                    <>
                      <Menu onClick={() => setSelectedTrackDepth(VesselTrackDepth.LAST_DEPARTURE)} second>
                        dernier DEP
                      </Menu>
                      <Menu onClick={() => setSelectedTrackDepth(VesselTrackDepth.TWELVE_HOURS)} second>
                        12 heures
                      </Menu>
                      <Menu onClick={() => setSelectedTrackDepth(VesselTrackDepth.ONE_DAY)} second>
                        24 heures
                      </Menu>
                      <Menu onClick={() => setSelectedTrackDepth(VesselTrackDepth.TWO_DAYS)} second>
                        2 jours
                      </Menu>
                      <Menu
                        data-cy="show-vessel-tracks-three-days"
                        onClick={() => setSelectedTrackDepth(VesselTrackDepth.THREE_DAYS)}
                        second
                      >
                        3 jours
                      </Menu>
                      <Menu onClick={() => setSelectedTrackDepth(VesselTrackDepth.ONE_WEEK)} second>
                        1 semaine
                      </Menu>
                      <Menu onClick={() => setSelectedTrackDepth(VesselTrackDepth.TWO_WEEK)} second>
                        2 semaines
                      </Menu>
                      <Menu onClick={() => setSelectedTrackDepth(VesselTrackDepth.ONE_MONTH)} second>
                        1 moiss
                      </Menu>
                      <Menu
                        data-cy="show-vessel-tracks-custom-period"
                        onClick={() => setIsTrackRangeModalOpen(true)}
                        second
                        withTopLine
                      >
                        Choisir une période précise
                      </Menu>
                    </>
                  ) : null}
                </SecondColumnMenu>
              ) : null}
            </Wrapper>
            <TrackRangeModal
              isOpen={isTrackRangeModalOpen}
              onChange={updateDateRange}
              onClose={() => setIsTrackRangeModalOpen(false)}
              selectedDates={selectedDateRange}
            />
          </>
        ) : null}
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
  box-shadow: 0px 2px 5px ${p => p.theme.color.charcoalShadow};
  height: min-content;
  cursor: pointer;
`

const SecondColumnMenu = styled.div`
  margin-left: 2px;
  width: 200px;
  box-shadow: 0px 2px 5px ${p => p.theme.color.charcoalShadow};
  cursor: pointer;
`

const Menu = styled.span`
  background: ${COLORS.white};
  padding: 5px ${props => (props.second ? 15 : 0)}px 0px 15px;
  height: 25px;
  display: inline-block;
  display: flex;
  width: 100%;
  border-top: ${props => (props.withTopLine ? 1 : 0)}px solid ${COLORS.lightGray};

  &:hover {
    background: ${COLORS.gainsboro};
  }
`

const WrapperToBeKeptForDOMManagement = styled.div``

export default MapMenuOverlay
