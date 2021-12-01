import React, { useState, useEffect } from 'react'
import { CustomInput } from '../commonStyles/Input.style'

const LayerNameInput = props => {
  const {
    layerName: initialLayerName
    // updateLayerName
  } = props

  const [layerName, setLayerName] = useState()

  const handleClickOutside = () => {
    // updateLayerName && updateLayerName(initialLayerName, layerName)
    console.log('should update from click outside')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      // updateLayerName && updateLayerName(initialLayerName, layerName)
      console.log('should update from enter')
    }
  }

  useEffect(() => {
    setLayerName(initialLayerName)
  }, [initialLayerName])

  return (<CustomInput
      value={layerName && layerName.replace(/[_]/g, ' ')}
      onChange={value => setLayerName(value)}
      onBlur={handleClickOutside}
      onKeyDown={handleKeyDown}
    />)
}

export default LayerNameInput
