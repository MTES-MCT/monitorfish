/* eslint-disable */

import nouislider, { type Options as NouisliderOptions } from 'nouislider'
import React, { useEffect, type CSSProperties } from 'react'
import type { Promisable } from 'type-fest'

import { isEqual } from './utils'

const areEqual = (prevProps: NouisliderProps, nextProps: NouisliderProps) => {
  const { disabled, range, start, step } = prevProps

  return (
    nextProps.step === step &&
    isEqual(nextProps.start, start) &&
    nextProps.disabled === disabled &&
    isEqual(nextProps.range, range)
  )
}

export type NouisliderProps = NouisliderOptions & {
  className?: string
  clickablePips?: boolean
  disabled?: boolean
  id?: any
  instanceRef?: any
  onChange?: () => Promisable<void>
  onEnd?: () => Promisable<void>
  onSet?: () => Promisable<void>
  onSlide?: (a: any, b: any, nextValue: any) => Promisable<void>
  onStart?: () => Promisable<void>
  onUpdate?: () => Promisable<void>
  style?: CSSProperties
}
function Nouislider({
  className,
  clickablePips = false,
  disabled = false,
  id = null,
  instanceRef = null,
  onChange = () => {},
  onEnd = () => {},
  onSet = () => {},
  onSlide = () => {},
  onStart = () => {},
  onUpdate = () => {},
  style,
  ...originalProps
}: NouisliderProps) {
  const sliderContainer = React.createRef<any | undefined>()

  // https://github.com/mmarkelov/react-nouislider/pull/52/files
  const getSlider = () => (sliderContainer.current || {}).noUiSlider

  useEffect(() => {
    const isCreatedRef = instanceRef && Object.prototype.hasOwnProperty.call(instanceRef, 'current')
    if (instanceRef && instanceRef instanceof Function) {
      instanceRef(sliderContainer.current)
    }

    if (isCreatedRef) {
      // eslint-disable-next-line no-param-reassign
      instanceRef.current = sliderContainer.current
    }

    return () => {
      if (isCreatedRef) {
        // eslint-disable-next-line no-param-reassign
        instanceRef.current = null
      }
    }
  }, [sliderContainer])

  const clickOnPip = pip => {
    const slider = getSlider()
    const value = Number(pip.target.getAttribute('data-value'))

    if (slider) {
      slider.set(value)
    }
  }

  const toggleDisable = disabled => {
    const sliderHTML = sliderContainer.current
    if (sliderHTML) {
      if (!disabled) {
        sliderHTML.removeAttribute('disabled')
      } else {
        sliderHTML.setAttribute('disabled', true)
      }
    }
  }

  const updateEvents = sliderComponent => {
    if (onStart) {
      sliderComponent.off('start')
      sliderComponent.on('start', onStart)
    }

    if (onSlide) {
      sliderComponent.off('slide')
      sliderComponent.on('slide', onSlide)
    }

    if (onUpdate) {
      sliderComponent.off('update')
      sliderComponent.on('update', onUpdate)
    }

    if (onChange) {
      sliderComponent.off('change')
      sliderComponent.on('change', onChange)
    }

    if (onSet) {
      sliderComponent.off('set')
      sliderComponent.on('set', onSet)
    }

    if (onEnd) {
      sliderComponent.off('end')
      sliderComponent.on('end', onEnd)
    }
  }

  const updateOptions = (options: NouisliderOptions) => {
    const sliderHTML = sliderContainer.current
    sliderHTML.noUiSlider.updateOptions(options)
  }

  const setClickableListeners = () => {
    if (clickablePips) {
      const sliderHTML = sliderContainer.current
      ;[...sliderHTML.querySelectorAll('.noUi-value')].forEach(pip => {
        pip.style.cursor = 'pointer'
        pip.addEventListener('click', clickOnPip)
      })
    }
  }

  const createSlider = () => {
    const sliderComponent = nouislider.create(sliderContainer.current, originalProps)

    updateEvents(sliderComponent)

    setClickableListeners()
  }

  useEffect(() => {
    const sliderHTML = sliderContainer.current
    if (sliderHTML) {
      toggleDisable(disabled)
      createSlider()
    }

    return () => {
      const slider = getSlider()

      if (slider) {
        slider.destroy()
      }

      if (sliderHTML) {
        ;[...sliderHTML.querySelectorAll('.noUi-value')].forEach(pip => {
          pip.removeEventListener('click', clickOnPip)
        })
      }
    }
  }, [])

  useEffect(() => {
    const slider = getSlider()

    if (slider) {
      setClickableListeners()
    }
  }, [])

  useEffect(() => {
    const slider = getSlider()

    if (slider) {
      updateOptions(originalProps)
      slider.set(originalProps.start)
      setClickableListeners()
    }
    toggleDisable(disabled)
  }, [disabled, originalProps])

  useEffect(() => {
    const slider = getSlider()

    if (slider) {
      updateEvents(slider)
    }
  }, [onUpdate, onChange, onSlide, onStart, onEnd, onSet])

  const options: any = {}
  if (id) {
    options.id = id
  }
  if (className) {
    options.className = className
  }

  return <div {...options} ref={sliderContainer} style={style} />
}

Nouislider.defaultProps = {
  animate: true,
  behaviour: 'tap',
  className: null,
  clickablePips: false,
  connect: false,
  direction: 'ltr',
  disabled: false,
  format: null,
  id: null,
  instanceRef: null,
  keyboardSupport: true,
  limit: null,
  margin: null,
  onChange: () => {},
  onEnd: () => {},
  onSet: () => {},
  onSlide: () => {},
  onStart: () => {},
  onUpdate: () => {},
  orientation: 'horizontal',
  padding: 0,
  pips: null,
  snap: false,
  step: null,
  style: null,
  tooltips: false
}

export default React.memo(Nouislider, areEqual)
