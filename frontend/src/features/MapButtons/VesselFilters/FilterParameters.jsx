import React from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'

import { MapPropertyTrigger } from '../../commonComponents/MapPropertyTrigger'

import HidingOtherVesselsSVG from '../../icons/Bouton_masquer_pistes_actif.svg?react'
import ShowingOtherVesselsSVG from '../../icons/Bouton_masquer_pistes_inactif.svg?react'
import { COLORS } from '../../../constants/constants'
import { setDisplayedComponents } from '../../../domain/shared_slices/DisplayedComponent'

const FilterParameters = ({ nonFilteredVesselsAreHidden, setNonFilteredVesselsAreHidden }) => {
  const dispatch = useDispatch()

  const handleCreateFilter = () => {
    dispatch(
      setDisplayedComponents({
        isVesselListModalDisplayed: true,
      })
    )
  }

  return (
    <Wrapper>
      <CreateFilterWrapper onClick={handleCreateFilter}>
        <CreateFilterButton>+</CreateFilterButton>
        <ShowLabelText data-cy={'vessel-filters-create-new-filter'} >
          Créer un nouveau filtre
        </ShowLabelText>
      </CreateFilterWrapper>
      <MapPropertyTrigger
        inverse
        booleanProperty={nonFilteredVesselsAreHidden}
        updateBooleanProperty={isChecked => setNonFilteredVesselsAreHidden(isChecked)}
        text={'les autres navires'}
        Icon={nonFilteredVesselsAreHidden ? ShowingOtherVesselsSVG : HidingOtherVesselsSVG}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background: ${COLORS.gainsboro};
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`

const ShowLabelText = styled.span`
  padding: 8px 10px;
  color: ${COLORS.slateGray};
  vertical-align: top;
  display: inline-block;
`
const CreateFilterButton = styled.span`
  background: ${COLORS.charcoal};
  display: inline-block;
  font-size: 32px;
  width: 36px;
  height: 36px;
  line-height: 23px;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  color: ${COLORS.white};
`
const CreateFilterWrapper = styled.div`
  background: ${COLORS.gainsboro};
  cursor: pointer;
  text-align: left;
`

export default FilterParameters
