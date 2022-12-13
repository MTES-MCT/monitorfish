import { useRef } from 'react'
import { SelectPicker } from 'rsuite'
import { NOTIFICATION_TYPE } from '../../../domain/entities/beaconMalfunction/constants'
import { COLORS } from '../../../constants/constants'

const DEFAULT_SELECT_PICKER_STYLE = {
  width: 150,
  margin: '2px 0 0 20px',
  borderColor: COLORS.lightGray,
  boxSizing: 'border-box',
  textOverflow: 'ellipsis'
}

const DEFAULT_SELECT_PICKER_MENU_STYLE = {
  width: 200,
  overflowY: 'hidden',
  textOverflow: 'ellipsis',
  position: 'absolute',
  marginTop: 10,
  marginLeft: 592
}

const FilterByStatus = () => {
  const selectMenuRef = useRef()

  return (<>
    <SelectPicker
      container={() => selectMenuRef.current}
      style={DEFAULT_SELECT_PICKER_STYLE}
      menuStyle={DEFAULT_SELECT_PICKER_MENU_STYLE}
      searchable={false}
      cleanable={false}
      value={null}
      placeholder={'Filtrer par statut'}
      data={Object.keys(NOTIFICATION_TYPE)
        .map(type => ({ label: NOTIFICATION_TYPE[type].followUpMessage, value: type }))}
    />
    <div ref={selectMenuRef} />
  </>)
}

export default FilterByStatus
