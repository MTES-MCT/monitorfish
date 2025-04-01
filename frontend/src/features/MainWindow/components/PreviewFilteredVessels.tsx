import { undoPreviewVessels } from '@features/Vessel/useCases/VesselListV2/undoPreviewVessels'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import BackToVesselsListSVG from '../../icons/Fleche_navigation_marees_gainsboro.svg?react'

export function PreviewFilteredVessels() {
  const dispatch = useMainAppDispatch()

  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)

  return (
    <>
      {previewFilteredVesselsMode && (
        <Wrapper data-cy="back-to-vessels-list" onClick={() => dispatch(undoPreviewVessels())}>
          <Text>
            <BackToVesselsList />
            Revenir à la liste des navires
          </Text>
        </Wrapper>
      )}
    </>
  )
}

const BackToVesselsList = styled(BackToVesselsListSVG)`
  vertical-align: revert;
  width: 19px;
  margin-right: 10px;
  transform: rotate(180deg);
`

const Text = styled.div`
  font: normal normal normal 22px/31px Marianne;
  color: ${p => p.theme.color.gainsboro};
`

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  background: ${p => p.theme.color.charcoal} 0% 0% no-repeat padding-box;
  width: 100%;
  height: 24px;
  text-align: center;
  padding: 17px;
  padding-top: 9px;
  cursor: pointer;
  z-index: 1045;
`
