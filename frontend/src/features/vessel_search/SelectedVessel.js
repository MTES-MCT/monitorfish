import focusOnVesselSearch, { focusState } from '../../domain/use_cases/focusOnVesselSearch'
import countries from 'i18n-iso-countries'
import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { ReactComponent as CloseIconSVG } from '../icons/Croix_grise.svg'
import { useDispatch, useSelector } from 'react-redux'

const SelectedVessel = ({ selectedVesselIdentity, setSelectedVesselIdentity }) => {
  const dispatch = useDispatch()

  const {
    vesselSidebarIsOpen,
    isFocusedOnVesselSearch
  } = useSelector(state => state.vessel)

  function getVesselName () {
    let flagState = 'INCONNU'
    if (selectedVesselIdentity.flagState !== 'UNDEFINED') {
      flagState = `${selectedVesselIdentity.flagState}`
    }

    return `${selectedVesselIdentity.vesselName} (${flagState})`
  }

  return (
    <Wrapper
      data-cy={'vessel-search-selected-vessel-title'}
      onClick={() => {
        if (vesselSidebarIsOpen) {
          dispatch(focusOnVesselSearch(focusState.CLICK_VESSEL_TITLE))
        }
      }}
      vesselSidebarIsOpen={vesselSidebarIsOpen}
      vesselName={selectedVesselIdentity.vesselName}
      isFocusedOnVesselSearch={isFocusedOnVesselSearch}
    >
      {selectedVesselIdentity.flagState
        ? <Flag
          title={countries.getName(selectedVesselIdentity.flagState, 'fr')}
          src={`flags/${selectedVesselIdentity.flagState.toLowerCase()}.svg`}/>
        : null}
      <VesselName>
        {getVesselName()}
      </VesselName>
      <CloseIcon
        data-cy={'vessel-search-selected-vessel-close-title'}
        onClick={() => setSelectedVesselIdentity(null)}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  font-weight: bolder;
  margin: 0;
  background-color: ${COLORS.charcoal};
  border: none;
  border-radius: 0;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  color: ${COLORS.gainsboro};
  height: 40px;
  width: 490px;
  padding: 0 0 0 10px;
  flex: 3;
  text-align: left;
  cursor: text;
  animation: ${props => props.firstUpdate && !props.vesselSidebarIsOpen
  ? ''
  : props.vesselSidebarIsOpen && !props.isFocusedOnVesselSearch
    ? 'vessel-search-opening'
    : ''} 0.7s ease forwards;

  @keyframes vessel-search-opening {
    0%   { width: ${props => props.vesselName ? '490px' : '320px'};   }
    100% { width: 490px; }
  }

  :hover, :focus {
    border-bottom: 1px ${COLORS.gray} solid;
  }
`

const Flag = styled.img`
  vertical-align: middle;
  font-size: 27px;
  margin-left: 0px;
  display: inline-block;
  height: 24px;
`

const VesselName = styled.span`
  display: inline-block;
  color: ${COLORS.grayLighter};
  margin: 0 0 0 10px;
  line-height: 39px;
  font-weight: 500;
  vertical-align: middle;
  font-size: 22px;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 20px;
  float: right;
  padding: 9px 9px 7px 7px;
  height: 24px;
  cursor: pointer;
`

export default SelectedVessel
