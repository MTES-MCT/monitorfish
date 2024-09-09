import { Radio } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { BaseLayers } from '../../../../domain/entities/layers/constants'

type BaseLayerRowProps = {
  layer: string
  onChange: (string) => void
  selectedBaseLayer: string
}
export function BaseMap({ layer, onChange, selectedBaseLayer }: BaseLayerRowProps) {
  return (
    <Row className="base-layers-selection" onClick={() => onChange(layer)}>
      {BaseLayers[layer].text}{' '}
      <StyledRadio checked={layer === selectedBaseLayer} name={layer} value={layer}>
        {' '}
      </StyledRadio>
    </Row>
  )
}

const StyledRadio = styled(Radio)`
  margin-left: auto;
  margin-right: 4px;
  padding-top: 3px;
`

const Row = styled.li`
  padding: 6px 5px 5px 20px;
  margin: 0;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  cursor: pointer;
  color: ${p => p.theme.color.gunMetal};
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  line-height: 25px;
  user-select: none;
  display: flex;

  &:hover {
    background: ${p => p.theme.color.blueGray25};
  }
`
