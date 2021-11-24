import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'

import { openVesselListModal } from '../../domain/shared_slices/Global'
import MapPropertyTrigger from '../commonComponents/MapPropertyTrigger'
import { ReactComponent as HideIconSVG } from '../icons/eye_not.svg'
import { ReactComponent as ShowIconSVG } from '../icons/eye.svg'
import { COLORS } from '../../constants/constants'

const HideNonFilteredVessels = ({ nonFilteredVesselsAreHidden, setNonFilteredVesselsAreHidden }) => {
  const [value, setValue] = useState(undefined)
  const dispatch = useDispatch()

  useEffect(() => {
    if (nonFilteredVesselsAreHidden !== undefined && value === undefined) {
      setValue(nonFilteredVesselsAreHidden)
    }
  }, [nonFilteredVesselsAreHidden])
  const handleCreateFilter = () => {
    dispatch(openVesselListModal())
  }

  return (
    <Wrapper>
      <CreateFilterWrapper onClick={handleCreateFilter}>
        <ButtonCreateFilter>+</ButtonCreateFilter>
        <ShowLabelText data-cy={'vessel-filters-create-new-filter'} >
          Créer un nouveau filtre
        </ShowLabelText>
      </CreateFilterWrapper>
      {value !== undefined
        ? <MapPropertyTrigger
            booleanProperty={value}
            updateBooleanProperty={isChecked => {
              setNonFilteredVesselsAreHidden(isChecked)
              setValue(isChecked)
            }
            }
            text={'les autres navires'}
            Icon={value ? HideIconSVG : ShowIconSVG}
            size={24}
          />
        : null
      }
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background: ${COLORS.gainsboro};
  padding: 0 0 9px 0;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`

const ShowLabelText = styled.span`
  margin-left: 5px;
  color: ${COLORS.slateGray};
`
const ButtonCreateFilter = styled.span`
  background: ${COLORS.charcoal};
  display: inline-block;
  font-size: 32px;
  width: 36px;
  height: 36px;
  line-height: 23px;
  font-weight: 300;
  text-align: center;
  vertical-align: middle;
  color: ${COLORS.white};
`
const CreateFilterWrapper = styled.div`
  background: ${COLORS.gainsboro};
  cursor: pointer;
  text-align: left;
`

export default HideNonFilteredVessels
