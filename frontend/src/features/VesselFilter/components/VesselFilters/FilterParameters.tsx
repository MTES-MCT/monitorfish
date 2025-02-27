import { hideOrShowNonFilteredVessels } from '@features/VesselFilter/useCases/hideOrShowNonFilteredVessels'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import { setDisplayedComponents } from '../../../../domain/shared_slices/DisplayedComponent'
import { MapPropertyTrigger } from '../../../commonComponents/MapPropertyTrigger'
import HidingOtherVesselsSVG from '../../../icons/Bouton_masquer_pistes_actif.svg?react'
import ShowingOtherVesselsSVG from '../../../icons/Bouton_masquer_pistes_inactif.svg?react'

export function FilterParameters() {
  const dispatch = useMainAppDispatch()
  const nonFilteredVesselsAreHidden = useMainAppSelector(state => state.filter.nonFilteredVesselsAreHidden)

  const handleCreateFilter = () => {
    dispatch(
      setDisplayedComponents({
        isVesselListModalDisplayed: true
      })
    )
  }

  return (
    <Wrapper>
      <CreateFilterWrapper onClick={handleCreateFilter}>
        <CreateFilterButton>+</CreateFilterButton>
        <ShowLabelText data-cy="vessel-filters-create-new-filter">Créer un nouveau filtre</ShowLabelText>
      </CreateFilterWrapper>
      <MapPropertyTrigger
        booleanProperty={nonFilteredVesselsAreHidden}
        IconSVG={nonFilteredVesselsAreHidden ? ShowingOtherVesselsSVG : HidingOtherVesselsSVG}
        inverse
        text="les autres navires"
        updateBooleanProperty={isChecked => dispatch(hideOrShowNonFilteredVessels(isChecked))}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background: ${p => p.theme.color.gainsboro};
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`

const ShowLabelText = styled.span`
  padding: 8px 10px;
  color: ${p => p.theme.color.slateGray};
  vertical-align: top;
  display: inline-block;
`
const CreateFilterButton = styled.span`
  background: ${p => p.theme.color.charcoal};
  display: inline-block;
  font-size: 32px;
  width: 36px;
  height: 36px;
  line-height: 23px;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  color: ${p => p.theme.color.white};
`
const CreateFilterWrapper = styled.div`
  background: ${p => p.theme.color.gainsboro};
  cursor: pointer;
  text-align: left;
`
