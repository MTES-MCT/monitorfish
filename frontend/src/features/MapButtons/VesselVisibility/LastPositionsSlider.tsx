import { useEffect, useState } from 'react'
import { RangeSlider } from 'rsuite'
import styled from 'styled-components'

import Nouislider from '../../../ui/Nouislider'

import type { LastPositionVisibility } from '../../../domain/types/map'

// Hours
const labels = [48, 24, 12, 6, 3, 2, 1]

declare type Range = [number, number]

type LastPositionsSliderProps = {
  updateVesselsLastPositionVisibility: (hidden, opacityReduced) => void
  vesselsLastPositionVisibility: LastPositionVisibility
}
export function LastPositionsSlider({
  updateVesselsLastPositionVisibility,
  vesselsLastPositionVisibility
}: LastPositionsSliderProps) {
  const [value, setValue] = useState<Range>([0, 0])

  useEffect(() => {
    if (vesselsLastPositionVisibility && !value) {
      const opacityReducedIndex = labels.findIndex(label => vesselsLastPositionVisibility.opacityReduced === label)
      const hiddenIndex = labels.findIndex(label => vesselsLastPositionVisibility.hidden === label)
      setValue([hiddenIndex, opacityReducedIndex])
    }
  }, [value, vesselsLastPositionVisibility])

  function updateValue(nextValue: any) {
    if (nextValue[0] !== value[0] || nextValue[1] !== value[1]) {
      const nextValueInt = [parseInt(nextValue[0], 10), parseInt(nextValue[1], 10)]
      setValue(nextValueInt as Range)

      const [first, second] = nextValueInt
      updateVesselsLastPositionVisibility(labels[first!], labels[second!])
    }
  }

  return (
    value && (
      <SliderWrapper>
        <Nouislider
          behaviour="tap"
          connect={[true, true, true]}
          keyboardSupport
          onSlide={(_a, _b, nextValue) => updateValue(nextValue)}
          orientation="horizontal"
          range={{
            max: [6],
            min: [0, 1]
          }}
          start={value}
        />
        <RangeSlider
          defaultValue={value}
          graduated
          max={labels.length - 1}
          min={0}
          onChange={nextValue => updateValue(nextValue)}
          renderMark={mark => {
            switch (mark) {
              case 0:
                return '48h'
              case 1:
                return '24h'
              case 2:
                return '12h'
              case 3:
                return '6h'
              case 4:
                return '3h'
              case 5:
                return '2h'
              case 6:
                return '1h'
              default:
                return null
            }
          }}
          tooltip={false}
          value={value}
        />
      </SliderWrapper>
    )
  )
}

const SliderWrapper = styled.div`
  padding: 2px 35px 15px 30px;
  height: 30px;
  font-size: 13px;
  position: relative;
`
