/* eslint-disable */

import nouislider from 'nouislider'
import React, { useEffect } from 'react'
import type { Promisable } from 'type-fest'

import { isEqual } from './utils'

const areEqual = (prevProps, nextProps) => {
  const { disabled, range, start, step } = prevProps

  return (
    nextProps.step === step &&
    isEqual(nextProps.start, start) &&
    nextProps.disabled === disabled &&
    isEqual(nextProps.range, range)
  )
}

export type NouisliderProps = {
  animate?: boolean
  behaviour?: string
  className?: string
  clickablePips?: boolean
  connect?: boolean | boolean[]
  direction?: string
  disabled?: boolean
  format?: any
  id?: any
  instanceRef?: any
  keyboardSupport?: boolean
  limit?: any
  margin?: any
  onChange?: () => Promisable<void>
  onEnd?: () => Promisable<void>
  onSet?: () => Promisable<void>
  onSlide?: (a: any, b: any, nextValue: any) => Promisable<void>
  onStart?: () => Promisable<void>
  onUpdate?: () => Promisable<void>
  orientation?: 'horizontal'
  padding?: number
  pips?: any
  range: {
    max: number[]
    min: number[]
  }
  snap?: boolean
  start: [number, number]
  step?: any
  style?: any
  tooltips?: boolean
}
function Nouislider(_props: NouisliderProps) {
  const props = {
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
    tooltips: false,
    ..._props
  }

  const sliderContainer = React.createRef<any | undefined>()

  // https://github.com/mmarkelov/react-nouislider/pull/52/files
  const getSlider = () => (sliderContainer.current || {}).noUiSlider

  useEffect(() => {
    const { instanceRef } = props
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

  const { onChange, onEnd, onSet, onSlide, onStart, onUpdate } = props

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

  const updateOptions = options => {
    const sliderHTML = sliderContainer.current
    sliderHTML.noUiSlider.updateOptions(options)
  }

  const setClickableListeners = () => {
    if (props.clickablePips) {
      const sliderHTML = sliderContainer.current
      ;[...sliderHTML.querySelectorAll('.noUi-value')].forEach(pip => {
        pip.style.cursor = 'pointer'
        pip.addEventListener('click', clickOnPip)
      })
    }
  }

  const createSlider = () => {
    const sliderComponent = nouislider.create(sliderContainer.current, {
      ...props
    })

    updateEvents(sliderComponent)

    setClickableListeners()
  }

  useEffect(() => {
    const { disabled } = props
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

  const { animate, disabled, limit, margin, padding, pips, range, snap, start, step } = props

  useEffect(() => {
    const slider = getSlider()

    if (slider) {
      updateOptions({ animate, limit, margin, padding, pips, range, snap, step })
      slider.set(start)
      setClickableListeners()
    }
    toggleDisable(disabled)
  }, [start, disabled, range, step, margin, padding, limit, pips, snap, animate])

  useEffect(() => {
    const slider = getSlider()

    if (slider) {
      updateEvents(slider)
    }
  }, [onUpdate, onChange, onSlide, onStart, onEnd, onSet])

  const { className, id, style } = props
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
