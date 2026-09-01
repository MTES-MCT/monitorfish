import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { editName } from '../../useCases/editName'
import { fitToView } from '../../useCases/fitToView'
import { computeCustomZoneStyle } from '../../utils/computeCustomZoneStyle'
import { getColorAndStrokeFromStyles } from '../../utils/getColorAndStrokeFromStyles'
import { EditDialog } from '../EditDialog'

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
  display: flex;
  float: right;
  flex: 1;
  justify-content: flex-end;
  margin-right: 6px;
`

const ZoneName = styled.span`
  display: inline-block;
  max-width: 200px;
  padding-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Wrapper = styled.li`
  border-bottom: 1px solid ${THEME.color.lightGray};
  color: ${THEME.color.gunMetal};
  display: block;
  font-weight: 500;
  line-height: 18px;
  list-style-type: none;
  padding: 4px 0 4px 16px;
  text-align: left;
  user-select: none;
  width: -moz-available;
  width: -webkit-fill-available;
  width: stretch;

  &:hover {
    background: ${THEME.color.blueGray['25']};
  }
`

const ZonePreview = styled.div<{
  color: string
  stroke: string
}>`
  background: ${p => p.color};
  border: 1px solid ${p => p.stroke};
  cursor: zoom-in;
  display: inline-block;
  height: 15px;
  margin-right: 8px;
  margin-bottom: 2px;
  width: 15px;
`
