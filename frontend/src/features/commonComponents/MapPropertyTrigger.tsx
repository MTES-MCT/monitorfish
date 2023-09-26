import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

import type { FunctionComponent, SVGProps } from 'react'

type MapPropertyTriggerProps = {
  Icon: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>
  booleanProperty: boolean
  disabled?: boolean
  inverse?: boolean
  text: string
  updateBooleanProperty: (isChecked) => void
}
export function MapPropertyTrigger({
  booleanProperty,
  disabled,
  Icon,
  inverse,
  text,
  updateBooleanProperty
}: MapPropertyTriggerProps) {
  const showOrHideText = useMemo(() => {
    if (inverse) {
      return booleanProperty ? 'Afficher' : 'Masquer'
    }

    return booleanProperty ? 'Masquer' : 'Afficher'
  }, [inverse, booleanProperty])

  const update = useCallback(() => {
    if (!disabled) {
      updateBooleanProperty(!booleanProperty)
    }
  }, [disabled, updateBooleanProperty, booleanProperty])

  return (
    <Wrapper disabled={disabled} onClick={update}>
      <Icon
        style={{
          background: booleanProperty ? THEME.color.blueGray : THEME.color.charcoal,
          cursor: disabled ? 'not-allowed' : 'pointer',
          height: 36,
          transition: 'all 0.2s',
          width: 36
        }}
      />
      <ShowLabelText data-cy="map-property-trigger">
        {showOrHideText} {text}
      </ShowLabelText>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  disabled: boolean | undefined
}>`
  background: ${COLORS.gainsboro};
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  border-top: 1px solid ${COLORS.lightGray};
  text-align: left;
  height: 36px;
  cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
`

const ShowLabelText = styled.span`
  margin-left: 0;
  color: ${COLORS.slateGray};
  padding: 8.5px 10px;
  vertical-align: top;
  display: inline-block;
`
