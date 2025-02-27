import { IconButton, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { FunctionComponent, SVGProps, JSX } from 'react'

/**
 * `IconSVG` props is deprecated, use `Icon` instead.
 */
type MapPropertyTriggerProps = Readonly<{
  Icon?: FunctionComponent<JSX.Element>
  // TODO Remove this legacy props
  IconSVG?: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>
  booleanProperty: boolean
  booleanVerbs?: [string, string]
  disabled?: boolean
  inverse?: boolean
  text: string
  updateBooleanProperty: (isChecked) => void
}>
export function MapPropertyTrigger({
  booleanProperty,
  booleanVerbs = ['Masquer', 'Afficher'],
  disabled,
  Icon,
  IconSVG,
  inverse,
  text,
  updateBooleanProperty
}: MapPropertyTriggerProps) {
  const booleanVerb = (function () {
    if (inverse) {
      return booleanProperty ? booleanVerbs[1] : booleanVerbs[0]
    }

    return booleanProperty ? booleanVerbs[0] : booleanVerbs[1]
  })()

  const update = () => {
    if (!disabled) {
      updateBooleanProperty(!booleanProperty)
    }
  }

  return (
    <Wrapper disabled={disabled} onClick={update}>
      {!!Icon && (
        <IconButton
          color={THEME.color.white}
          Icon={Icon}
          iconSize={24}
          style={{
            background: booleanProperty ? THEME.color.blueGray : THEME.color.charcoal,
            border: 'unset',
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: 6
          }}
        />
      )}
      {!Icon && !!IconSVG && (
        <IconSVG
          style={{
            background: booleanProperty ? THEME.color.blueGray : THEME.color.charcoal,
            cursor: disabled ? 'not-allowed' : 'pointer',
            height: 36,
            transition: 'all 0.2s',
            width: 36
          }}
        />
      )}
      <ShowLabelText data-cy="map-property-trigger">
        {booleanVerb} {text}
      </ShowLabelText>
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  disabled: boolean | undefined
}>`
  display: flex;
  background: ${p => p.theme.color.gainsboro};
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  border-top: 1px solid ${p => p.theme.color.lightGray};
  text-align: left;
  height: 36px;
  cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
`

const ShowLabelText = styled.span`
  margin-left: 0;
  color: ${p => p.theme.color.slateGray};
  padding: 8.5px 10px;
  vertical-align: top;
  display: inline-block;
`
