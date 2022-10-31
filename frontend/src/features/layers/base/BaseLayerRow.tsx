import { Radio } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { BaseLayers } from '../../../domain/entities/layers/constants'
import { theme } from '../../../ui/theme'

type BaseLayerRowProps = {
  layer: string
}
export function BaseLayerRow({ layer }: BaseLayerRowProps) {
  return (
    <Row className="base-layers-selection">
      <Radio value={layer}>{BaseLayers[layer].text}</Radio>
    </Row>
  )
}

const Row = styled.li`
  padding: 6px 5px 5px 20px;
  margin: 0;
  text-align: left;
  list-style-type: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  cursor: pointer;
  background: ${p => p.theme.color.white};
  color: ${COLORS.gunMetal};
  border-bottom: 1px solid ${COLORS.lightGray};
  display: block;
  line-height: 18px;
  user-select: none;

  :hover {
    background: ${theme.color.blueGray['25']};
  }
`
