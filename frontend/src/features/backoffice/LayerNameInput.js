import React, { useState, useEffect, useRef } from 'react'
import { CustomInput } from '../commonStyles/Input.style'

const LayerNameInput = props => {
  const {
    layerName,
    updateLayerName,
    setIsLayerNameEditable
  } = props

  const [value, setValue] = useState()
  const ref = useRef()

  const update = () => {
    if (value && value !== layerName) {
      updateLayerName(layerName, value)
    }
    setIsLayerNameEditable(false)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      update(value)
    }
  }

  useEffect(() => {
    ref.current.focus()
  }, [])

  useEffect(() => {
    setValue(layerName)
  }, [layerName])

  return (<CustomInput
      inputRef={ref}
      value={value && value.replace(/[_]/g, ' ')}
      onChange={val => setValue(val)}
      onBlur={update}
      onKeyDown={handleKeyDown}
    />)
}

export default LayerNameInput
