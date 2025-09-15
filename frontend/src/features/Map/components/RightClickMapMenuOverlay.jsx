import Overlay from 'ol/Overlay'
import { createRef, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import { TrackRangeModal } from './map_menu/TrackRangeModal'
import { useClickOutsideWhenOpened } from '../../../hooks/useClickOutsideWhenOpened'
import { addVesselToFavorites } from '../../FavoriteVessel/slice'
import ChevronIconSVG from '../../icons/Chevron_simple_gris.svg?react'
import { getTrackRequestFromTrackDepth, VesselTrackDepth } from '../../Vessel/types/vesselTrackDepth'
import { showVesselTrack } from '../../Vessel/useCases/showVesselTrack'
import { monitorfishMap } from '../monitorfishMap'

export function RightClickMapMenuOverlay({ coordinates, vessel }) {
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
   * @param {DateRange | undefined} dateRange
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

      dispatch(showVesselTrack(vessel, true, trackRequest))

      monitorfishMap.removeOverlay(getOverlay())

      setIsOpen(false)
      setSelectedDateRange(dateRange)
      setSelectedTrackDepth(undefined)
      setIsTrackRangeModalOpen(false)
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

    dispatch(showVesselTrack(vessel, true, trackRequest))

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
    <>
      <WrapperToBeKeptForDOMManagement ref={ref}>
        <div ref={ref}>
          {isOpen ? (
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
                        onClick={() => dispatch(addVesselToFavorites(vessel)) && setIsOpen(false)}
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
                      <Menu $withPadding onClick={() => setSelectedTrackDepth(VesselTrackDepth.LAST_DEPARTURE)}>
                        dernier DEP
                      </Menu>
                      <Menu $withPadding onClick={() => setSelectedTrackDepth(VesselTrackDepth.TWELVE_HOURS)}>
                        12 heures
                      </Menu>
                      <Menu $withPadding onClick={() => setSelectedTrackDepth(VesselTrackDepth.ONE_DAY)}>
                        24 heures
                      </Menu>
                      <Menu $withPadding onClick={() => setSelectedTrackDepth(VesselTrackDepth.TWO_DAYS)}>
                        2 jours
                      </Menu>
                      <Menu
                        $withPadding
                        data-cy="show-vessel-tracks-three-days"
                        onClick={() => setSelectedTrackDepth(VesselTrackDepth.THREE_DAYS)}
                      >
                        3 jours
                      </Menu>
                      <Menu $withPadding onClick={() => setSelectedTrackDepth(VesselTrackDepth.ONE_WEEK)}>
                        1 semaine
                      </Menu>
                      <Menu $withPadding onClick={() => setSelectedTrackDepth(VesselTrackDepth.TWO_WEEK)}>
                        2 semaines
                      </Menu>
                      <Menu $withPadding onClick={() => setSelectedTrackDepth(VesselTrackDepth.ONE_MONTH)}>
                        1 mois
                      </Menu>
                      <Menu
                        $withPadding
                        $withTopLine
                        data-cy="show-vessel-tracks-custom-period"
                        onClick={() => setIsTrackRangeModalOpen(true)}
                      >
                        Choisir une période précise
                      </Menu>
                    </>
                  ) : null}
                </SecondColumnMenu>
              ) : null}
            </Wrapper>
          ) : null}
        </div>
      </WrapperToBeKeptForDOMManagement>
      {isTrackRangeModalOpen &&
        createPortal(
          <TrackRangeModal
            onChange={updateDateRange}
            onClose={() => setIsTrackRangeModalOpen(false)}
            selectedDates={selectedDateRange}
          />,
          document.body
        )}
    </>
  )
}

const Wrapper = styled.div`
  font: normal normal normal 13px/18px Marianne;
  letter-spacing: 0px;
  text-align: left;
  color: ${p => p.theme.color.slateGray};
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
  background: ${p => p.theme.color.white};
  padding: 5px ${p => (p.$withPadding ? 15 : 0)}px 0px 15px;
  height: 25px;
  display: inline-block;
  display: flex;
  width: 100%;
  border-top: ${p => (p.$withTopLine ? 1 : 0)}px solid ${p => p.theme.color.lightGray};

  &:hover {
    background: ${p => p.theme.color.gainsboro};
  }
`

const WrapperToBeKeptForDOMManagement = styled.div``
