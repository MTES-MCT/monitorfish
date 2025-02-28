import { COLORS } from '@constants/constants'
import { undoPreviewVessels } from '@features/Vessel/useCases/undoPreviewVessels'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

import BackToVesselsListSVG from '../../icons/Fleche_navigation_marees_gainsboro.svg?react'

export function PreviewFilteredVessels() {
  const dispatch = useMainAppDispatch()

  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)

  return (
    <>
      {previewFilteredVesselsMode ? (
        <Preview data-cy="back-to-vessels-list" onClick={() => dispatch(undoPreviewVessels())}>
          <Text>
            <BackToVesselsList />
            Revenir à la liste des navires
          </Text>
        </Preview>
      ) : null}
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
  color: ${COLORS.gainsboro};
`

const Preview = styled.div`
  background: ${COLORS.charcoal} 0% 0% no-repeat padding-box;
  width 100%;
  height: 24px;
  text-align: center;
  padding: 17px;
  padding-top: 9px;
  cursor: pointer;
`
