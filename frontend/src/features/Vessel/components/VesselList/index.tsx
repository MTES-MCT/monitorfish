import { MapToolButton } from '@features/MainWindow/components/MapButtons/shared/MapToolButton'
import { resetZonesSelected } from '@features/Vessel/components/VesselList/slice'
import { VesselListModal } from '@features/Vessel/components/VesselList/VesselListModal'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import { Modal } from 'rsuite'
import styled from 'styled-components'

import { setDisplayedComponents } from '../../../../domain/shared_slices/DisplayedComponent'
import { setBlockVesselsUpdate } from '../../../../domain/shared_slices/Global'
import { MapComponent } from '../../../commonStyles/MapComponent'
import VesselListSVG from '../../../icons/Icone_liste_navires.svg?react'

export function VesselList({ namespace }) {
  const dispatch = useMainAppDispatch()
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const isVesselListModalDisplayed = useMainAppSelector(state => state.displayedComponent.isVesselListModalDisplayed)
  const isRightMenuShrinked = !rightMenuIsOpen

  const onClose = useCallback(() => {
    dispatch(
      setDisplayedComponents({
        isVesselListModalDisplayed: false
      })
    )
    dispatch(setBlockVesselsUpdate(false))
    dispatch(resetZonesSelected())
  }, [dispatch])

  return (
    <>
      <Wrapper>
        <VesselListButton
          data-cy="vessel-list"
          isActive={isVesselListModalDisplayed}
          onClick={() =>
            dispatch(
              setDisplayedComponents({
                isVesselListModalDisplayed: true
              })
            )
          }
          style={{ top: 76 }}
          title="Liste des navires avec VMS"
        >
          <VesselIcon
            $background={isVesselListModalDisplayed ? THEME.color.blueGray : THEME.color.charcoal}
            $isRightMenuShrinked={isRightMenuShrinked}
            $isTitle={false}
          />
        </VesselListButton>
        <Modal backdrop="static" onClose={onClose} open={isVesselListModalDisplayed} size="full">
          {isVesselListModalDisplayed && <VesselListModal namespace={namespace} onClose={onClose} />}
        </Modal>
      </Wrapper>
    </>
  )
}

const Wrapper = styled(MapComponent)`
  transition: all 0.2s;
`

const VesselListButton = styled(MapToolButton)``

export const VesselIcon = styled(VesselListSVG)<{
  $background: string
  $isRightMenuShrinked: boolean | undefined
  $isTitle: boolean
}>`
  width: 25px;
  height: 25px;
  margin-top: 4px;
  opacity: ${p => (p.$isRightMenuShrinked ? '0' : '1')};
  vertical-align: ${p => (p.$isTitle ? 'text-bottom' : 'baseline')};
  circle {
    fill: ${p => p.$background};
  }
  transition: all 0.3s;
`
