import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Icon } from '@mtes-mct/monitor-ui'
import Overlay from 'ol/Overlay'
import { type MutableRefObject, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { monitorfishMap } from '../../Map/monitorfishMap'
import { navigateToFishingActivity } from '../useCases/navigateToFishingActivity'

import type { DisplayedLogbookOverlay } from '@features/Vessel/types/types'

type LogbookMessageOverlayProps = {
  logbookOverlay: DisplayedLogbookOverlay
}
export function LogbookMessageOverlay({ logbookOverlay }: LogbookMessageOverlayProps) {
  const dispatch = useMainAppDispatch()
  const logbookOverlayRef = useRef<HTMLDivElement>()
  const overlay = useMemo(
    () =>
      new Overlay({
        element: logbookOverlayRef.current,
        offset: [0, -4],
        position: logbookOverlay.coordinates,
        positioning: 'bottom-center'
      }),
    [logbookOverlay]
  )

  useEffect(() => {
    monitorfishMap.addOverlay(overlay)
    overlay.setElement(logbookOverlayRef.current)
    overlay.setPosition(logbookOverlay.coordinates)

    return () => {
      monitorfishMap.removeOverlay(overlay)
    }
  }, [overlay])

  return (
    <div>
      <Wrapper ref={logbookOverlayRef as MutableRefObject<HTMLDivElement>}>
        <Body
          onClick={() => dispatch(navigateToFishingActivity(logbookOverlay.id))}
          title={`Voir le message ${logbookOverlay.isDeleted ? 'supprimé ' : ''}${logbookOverlay.isNotAcknowledged ? 'non acquitté' : ''}`}
        >
          {logbookOverlay.isNotAcknowledged && <Icon.Reject size={17} style={{ marginBottom: 1, marginRight: 3 }} />}
          {logbookOverlay.isDeleted && <Icon.Delete size={17} style={{ marginBottom: 1, marginRight: 3 }} />}
          <LogbookMessageName data-cy="fishing-activity-name">{logbookOverlay.name}</LogbookMessageName>
        </Body>
        <TrianglePointer>
          <TriangleShadow />
        </TrianglePointer>
      </Wrapper>
    </div>
  )
}

const TrianglePointer = styled.div`
  margin-left: auto;
  margin-right: auto;
  height: auto;
  width: auto;
`

const TriangleShadow = styled.div`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 9px 5px 0 5px;
  border-color: ${p => p.theme.color.charcoal} transparent;
  text-align: center;
  margin: -3px auto auto;
`

const Wrapper = styled.div`
  z-index: 300;
`

const LogbookMessageName = styled.span`
  padding-bottom: 5px;
  vertical-align: middle;
  height: 30px;
  display: inline-block;
  user-select: none;
`

const Body = styled.span`
  background: ${p => p.theme.color.charcoal};
  border-radius: 1px;
  color: ${p => p.theme.color.gainsboro};
  margin-left: 0;
  font-size: 14px;
  padding: 0 6px 1px 6px;
  vertical-align: top;
  height: 22px;
  display: inline-block;
  user-select: none;
  cursor: pointer;
`
