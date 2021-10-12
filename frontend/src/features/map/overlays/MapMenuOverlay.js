import React, { createRef, useEffect, useState } from 'react'
import Overlay from 'ol/Overlay'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { useClickOutsideComponent } from '../../../hooks/useClickOutside'
import { ReactComponent as ChevronIconSVG } from '../../icons/Chevron_simple_gris.svg'
import { VesselTrackDepth } from '../../../domain/entities/vesselTrackDepth'
import CustomTrackDepthModal from './map_menu/CustomTrackDepthModal'

const MapMenuOverlay = props => {
  const {
    map,
    coordinates,
    isVessel
  } = props

  const ref = createRef()
  const [overlay] = useState(new Overlay({
    element: ref.current,
    position: coordinates,
    autoPan: false,
    positioning: 'left-center',
    zIndex: 9999
  }))
  const clickedOutsideComponent = useClickOutsideComponent(ref)
  const [showTrackMenu, setShowTrackMenu] = useState(false)
  const [modalIsOpen, setModalIsOpen] = useState(false)

  const [showTrackOf, setShowTrackOf] = useState(undefined)
  const [datesSelection, setDateSelection] = useState([])

  useEffect(() => {
    if (clickedOutsideComponent && !modalIsOpen) {
      map.removeOverlay(overlay)
    }
  }, [clickedOutsideComponent])

  useEffect(() => {
    if (showTrackOf) {
      map.removeOverlay(overlay)
    }
  }, [showTrackOf])

  useEffect(() => {
    if (map && coordinates?.length) {
      overlay.setPosition(coordinates)
      overlay.setElement(ref.current)
      setShowTrackMenu(false)
      ref.current.parentNode.className = 'ol-overlay-container ol-selectable overlay-active'

      map.addOverlay(overlay)

      return () => {
        map.removeOverlay(overlay)
      }
    }
  }, [overlay, coordinates, map])

  return (
    <WrapperToBeKeptForDOMManagement>
      <div ref={ref}>
        <Wrapper>
          <FirstMenu>
            {
              isVessel
                ? <Menu onClick={() => setShowTrackMenu(!showTrackMenu)}>
                  Afficher la piste VMS depuis…
                  <ChevronIcon/>
                </Menu>
                : null
            }
          </FirstMenu>
          {
            showTrackMenu
              ? <SecondMenu>
                  {
                    isVessel
                      ? <>
                        <Menu second onClick={() => setShowTrackOf(VesselTrackDepth.LAST_DEPARTURE)}>dernier DEP</Menu>
                        <Menu second onClick={() => setShowTrackOf(VesselTrackDepth.TWELVE_HOURS)}>12 heures</Menu>
                        <Menu second onClick={() => setShowTrackOf(VesselTrackDepth.ONE_DAY)}>24 heures</Menu>
                        <Menu second onClick={() => setShowTrackOf(VesselTrackDepth.TWO_DAYS)}>2 jours</Menu>
                        <Menu second onClick={() => setShowTrackOf(VesselTrackDepth.THREE_DAYS)}>3 jours</Menu>
                        <Menu second onClick={() => setShowTrackOf(VesselTrackDepth.ONE_WEEK)}>1 semaine</Menu>
                        <Menu second onClick={() => setShowTrackOf(VesselTrackDepth.TWO_WEEK)}>2 semaines</Menu>
                        <Menu second onClick={() => setShowTrackOf(VesselTrackDepth.ONE_MONTH)}>1 mois</Menu>
                        <Menu withTopLine second onClick={() => setModalIsOpen(true)}>Choisir une période précise</Menu>
                      </>
                      : null
                  }
                </SecondMenu>
              : null
          }
        </Wrapper>
        <CustomTrackDepthModal
          isModalOpen={modalIsOpen}
          setModalIsOpen={setModalIsOpen}
          datesSelection={datesSelection}
          setDateSelection={setDateSelection}
        />
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

const FirstMenu = styled.div`
  display: flex;
  width: 240px;
  box-shadow: 0px 2px 5px ${COLORS.overlayShadow};
  height: min-content;
  cursor: pointer;
`

const SecondMenu = styled.div`
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

const WrapperToBeKeptForDOMManagement = styled.div`
  z-index: 99999999;
`

export default MapMenuOverlay
