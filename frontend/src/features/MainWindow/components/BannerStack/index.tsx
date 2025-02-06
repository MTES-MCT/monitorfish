import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { isDefined } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { Item } from './Item'
import { mainWindowActions } from '../../slice'

// TODO Implement top positionning with a visible `<Healthcheck />`.
// Use as relative `<MainWindowLayout />` wrapper for that, not a calculation.
export function BannerStack() {
  const dispatch = useMainAppDispatch()
  const bannerStack = useMainAppSelector(state => state.mainWindow.bannerStack)

  const remove = (bannerStackRank: number) => {
    dispatch(mainWindowActions.removeBanner(bannerStackRank))
  }

  const bannerStackItems = Object.values(bannerStack.entities).filter(isDefined)

  if (bannerStackItems.length === 0) {
    return <></>
  }

  return (
    <Wrapper>
      {bannerStackItems.map(({ id, props }) => (
        <Item key={`banner-${id}`} bannerProps={props} bannerStackRank={id} onCloseOrAutoclose={remove} />
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 9999;
`
