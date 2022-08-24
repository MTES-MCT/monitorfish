import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Radio } from 'rsuite'
import styled from 'styled-components'

import { baseLayers } from '../../../domain/entities/layers'
import { selectBaseLayer } from '../../../domain/shared_slices/Map'

function BaseLayerItem({ isShownOnInit, layer }) {
  const dispatch = useDispatch()

  const firstUpdate = useRef(true)
  const [showLayer_, setShowLayer] = useState(undefined)

  useEffect(() => {
    if (showLayer_ === undefined) {
      setShowLayer(isShownOnInit)
    }
  }, [isShownOnInit, showLayer_])

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false

      return
    }

    if (showLayer_) {
      callSelectBaseLayer(baseLayers[layer].code)
    }
  }, [showLayer_])

  function callSelectBaseLayer(baseLayer) {
    dispatch(selectBaseLayer(baseLayer))
  }

  return (
    <>
      {layer ? (
        <Row className="base-layers-selection">
          <Radio
            checked={isShownOnInit}
            onChange={() => {
              callSelectBaseLayer(baseLayers[layer].code)
            }}
            value={layer}
          >
            {baseLayers[layer].text}
          </Radio>
        </Row>
      ) : null}
    </>
  )
}

const Row = styled.span`
  width: 100%;
  display: block;
  line-height: 18px;
  padding-left: 20px;
  user-select: none;
`

export default BaseLayerItem
