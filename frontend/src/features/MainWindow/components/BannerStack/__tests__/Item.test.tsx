import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { Level, THEME, ThemeProvider } from '@mtes-mct/monitor-ui'
import { act, render } from '@testing-library/react'

import { Item } from '../Item'

import type { BannerStackItemProps } from 'types'

const getBannerProps = (): BannerStackItemProps => ({
  children: 'Ce navire n’a pas envoyé de message JPE pendant cette période.',
  closingDelay: 3000,
  isClosable: true,
  isFixed: true,
  level: Level.WARNING,
  withAutomaticClosing: true
})

describe('MainWindow/BannerStack/Item', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('Should auto-close after its closing delay even when re-rendered by the stack', () => {
    const onCloseOrAutoclose = jest.fn()
    const renderItem = () => (
      <ThemeProvider theme={THEME}>
        <Item bannerProps={getBannerProps()} bannerStackRank={1} onCloseOrAutoclose={onCloseOrAutoclose} />
      </ThemeProvider>
    )

    const { rerender } = render(renderItem())

    // A new banner is added to the stack, which re-renders the existing ones
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    rerender(renderItem())

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(onCloseOrAutoclose).toHaveBeenCalledWith(1)
  })
})
