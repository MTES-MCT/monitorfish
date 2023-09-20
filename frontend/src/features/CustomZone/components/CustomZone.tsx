import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { EditDialog } from './EditDialog'
import { COLORS } from '../../../constants/constants'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { editName } from '../useCases/editName'
import { fitToView } from '../useCases/fitToView'
import { computeCustomZoneStyle } from '../utils/computeCustomZoneStyle'
import { getColorAndStrokeFromStyles } from '../utils/getColorAndStrokeFromStyles'

type CustomZoneType = {
  isShown: boolean
  name: string
  onRemove: (uuid: string) => void
  onToggleShowZone: (uuid: string) => void
  uuid: string
}
export function CustomZone({ isShown, name, onRemove, onToggleShowZone, uuid }: CustomZoneType) {
  const dispatch = useMainAppDispatch()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { color, stroke } = useMemo(() => {
    const styles = computeCustomZoneStyle(uuid, name)

    return getColorAndStrokeFromStyles(styles)
  }, [uuid, name])

  return (
    <>
      <Wrapper>
        <ZonePreview color={color} data-cy="custom-zone-zoom-button" onClick={() => fitToView(uuid)} stroke={stroke} />
        <ZoneName data-cy="custom-zone-name" title={name}>
          {name}
        </ZoneName>
        <Icons>
          <EditIcon
            color={THEME.color.slateGray}
            data-cy="custom-zone-edit-button"
            onClick={() => setIsEditDialogOpen(true)}
            size={20}
            title="Afficher la zone"
          />
          <DisplayIcon
            color={isShown ? THEME.color.slateGray : THEME.color.lightGray}
            data-cy="custom-zone-display-button"
            onClick={() => onToggleShowZone(uuid)}
            size={20}
            title="Afficher la zone"
          />
          <RemoveIcon
            color={THEME.color.slateGray}
            data-cy="custom-zone-remove-button"
            onClick={() => onRemove(uuid)}
            size={15}
            title="Supprimer la zone importée"
          />
        </Icons>
      </Wrapper>
      {isEditDialogOpen && (
        <EditDialog
          initialName={name}
          onCancel={() => setIsEditDialogOpen(false)}
          onConfirm={nextName => {
            dispatch(editName(uuid, nextName))
            setIsEditDialogOpen(false)
          }}
        />
      )}
    </>
  )
}

const RemoveIcon = styled(Icon.Close)<{
  title: string
}>`
  margin: 8px 10px 0 0;
  cursor: pointer;
`

const DisplayIcon = styled(Icon.Display)<{
  title: string
}>`
  margin: 5px 10px 0 0;
  cursor: pointer;
`

const EditIcon = styled(Icon.EditUnbordered)<{
  title: string
}>`
  margin: 5px 10px 0 0;
  cursor: pointer;
`

const Icons = styled.span`
  float: right;
  display: flex;
  justify-content: flex-end;
  flex: 1;
  margin-right: 6px;
`

const ZoneName = styled.span`
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-top: 5px;
  max-width: 200px;
  white-space: nowrap;
`

const Wrapper = styled.li`
  line-height: 18px;
  text-align: left;
  list-style-type: none;
  color: ${COLORS.gunMetal};
  border-bottom: 1px solid ${COLORS.lightGray};
  padding: 4px 0 4px 16px;
  display: block;
  user-select: none;
  font-weight: 500;
  width: -moz-available;
  width: -webkit-fill-available;
  width: stretch;

  :hover {
    background: ${THEME.color.blueGray['25']};
  }
`

const ZonePreview = styled.div<{
  color: string
  stroke: string
}>`
  width: 15px;
  height: 15px;
  background: ${p => p.color};
  border: 1px solid ${p => p.stroke};
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 2px;
  cursor: zoom-in;
`
