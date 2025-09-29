import { setVesselsLastPositionVisibility } from '@features/Map/slice'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { PipsMode } from 'nouislider'
import styled from 'styled-components'

import Nouislider from '../../../../ui/Nouislider'

// Hours
const LABELS = [48, 24, 12, 6, 3, 2, 1]

export function LastPositionsVisibilitySlider() {
  const dispatch = useMainAppDispatch()
  const vesselsLastPositionVisibility = useMainAppSelector(state => state.map.vesselsLastPositionVisibility)

  const visibilityArray = (function () {
    if (!vesselsLastPositionVisibility) {
      return [1, 2]
    }

    const opacityReducedIndex = LABELS.findIndex(label => vesselsLastPositionVisibility.opacityReduced === label)
    const hiddenIndex = LABELS.findIndex(label => vesselsLastPositionVisibility.hidden === label)

    return [hiddenIndex, opacityReducedIndex]
  })()

  function updateValue(nextValue: any) {
    const nextValueInt = [parseInt(nextValue[0], 10), parseInt(nextValue[1], 10)]

    const [first, second] = nextValueInt
    dispatch(
      setVesselsLastPositionVisibility({
        hidden: LABELS[first!],
        opacityReduced: LABELS[second!]
      })
    )
  }

  const format = {
    from(value) {
      return LABELS.indexOf(value)
    },
    to(value) {
      return `${LABELS[Math.round(value)]}h`
    }
  }

  return (
    <SliderWrapper>
      <Nouislider
        behaviour="tap"
        connect={[true, true, true]}
        keyboardSupport
        onSlide={(_a, _b, nextValue) => updateValue(nextValue)}
        orientation="horizontal"
        pips={{
          density: 50,
          format,
          mode: PipsMode.Steps
        }}
        range={{ max: LABELS.length - 1, min: 0 }}
        start={visibilityArray}
        step={1}
      />
    </SliderWrapper>
  )
}

const SliderWrapper = styled.div`
  height: 30px;
  padding: 2px 24px 15px 16px;
  font-size: 13px;

  .noUi-base {
    height: 2px;
  }

  .noUi-target {
    background: none;
    border-radius: unset;
    border: none;
    box-shadow: none;
  }

  .noUi-connect:nth-child(1) {
    background: #cccfd6;
  }

  .noUi-connect:nth-child(2) {
    background: #9095a2;
  }

  .noUi-connect:nth-child(3) {
    background: #3b4559;
  }

  .noUi-handle-lower {
    height: 16px;
    width: 16px;
    top: -6px;
    right: -8px; /* half the width */
    border-radius: 8px;
    background: #9095a2;
    box-shadow: unset;
    border: unset;
    cursor: pointer;
  }

  .noUi-handle-upper {
    height: 16px;
    width: 16px;
    top: -6px;
    right: -8px; /* half the width */
    border-radius: 8px;
    background: #3b4559;
    box-shadow: unset;
    border: unset;
    cursor: pointer;
  }

  .noUi-handle:before {
    background: unset;
  }

  .noUi-handle:after {
    background: unset;
  }

  .noUi-pips {
    padding-top: 0;
    top: -3px;
  }

  .noUi-marker-horizontal {
    height: 8px;
    width: 8px;
    border-radius: 8px;
    background: ${p => p.theme.color.lightGray};
  }

  .noUi-marker-horizontal:nth-child(13) {
    height: 8px;
    width: 8px;
    border-radius: 8px;
    background-color: #3b4559;
  }

  .noUi-value {
    margin-top: 6px;
    margin-left: 6px;
    font-size: 13px;
    color: #ff3392;
  }
`
