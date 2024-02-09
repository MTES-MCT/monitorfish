import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { COLORS } from '../../../../../constants/constants'

export const TableBody = styled.tbody``

export const Zone = styled.div`
  padding: 10px 10px 10px 10px;
  margin-top: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${p => p.theme.color.white};
`

export const Table = styled.table`
  padding: 0px 5px 0 5px;
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
`

export const TableRow = styled.tr`
  line-height: 21px;
  font-size: 13px;
`

export const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
  display: inline-block;
`

export const TableKey = styled.th`
  color: ${p => p.theme.color.slateGray};
  display: inline-block;
  border: none;
  background: none;
  padding-right: 5px;
  font-weight: normal;
`

export const TableValue = styled.td`
  color: ${p => p.theme.color.gunMetal};
  text-align: left;
  padding-right: 5px;
  padding-left: 5px;
  background: none;
  border: none;
`

export const Gray = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 300;
`

export const FirstInlineKey = styled.div`
  color: ${p => p.theme.color.slateGray};
  display: inline-block;
  padding: 0px 5px 0px 0;
`

export const SecondInlineKey = styled.div`
  color: ${p => p.theme.color.slateGray};
  display: inline-block;
  padding: 0px 5px 0px 10px;
`

export const SpeciesList = styled.ul<{
  $hasCatches: boolean
}>`
  margin: ${p => (p.$hasCatches ? 10 : 0)}px 0 0 0;
  padding: 0;
  width: -moz-available;
  width: -webkit-fill-available;
`

export const FilterMessagesStyle = {
  clearIndicator: base => ({ ...base, padding: 1, width: 18 }),
  container: provided => ({
    ...provided,
    height: 'fit-content',
    padding: 0,
    width: '-moz-available',
    zIndex: 4
  }),
  control: base => ({ ...base, borderColor: COLORS.lightGray, borderRadius: 'unset', fontSize: 13, minHeight: 26 }),
  dropdownIndicator: base => ({ ...base, padding: 1, width: 18 }),
  input: () => ({ margin: 0, padding: 0 }),
  menu: base => ({ ...base, margin: 0, maxHeight: 360, padding: 0 }),
  menuList: base => ({ ...base, maxHeight: 360 }),
  menuPortal: base => ({ ...base, zIndex: 9999 }),
  multiValue: base => ({ ...base, background: COLORS.gainsboro, borderRadius: 12, fontSize: 13 }),
  multiValueLabel: base => ({
    ...base,
    background: COLORS.gainsboro,
    borderRadius: 12,
    color: COLORS.slateGray,
    paddingBottom: 1,
    paddingTop: 2
  }),
  multiValueRemove: base => ({
    ...base,
    '&:hover': {
      backgroundColor: THEME.color.blueYonder25,
      color: THEME.color.blueYonder
    },
    background: COLORS.gainsboro,
    borderRadius: 12,
    color: THEME.color.slateGray
  }),
  option: base => ({ ...base, fontSize: 13 }),
  placeholder: base => ({ ...base, fontSize: 13 }),
  singleValue: base => ({ ...base, fontSize: 13 }),
  valueContainer: base => ({ ...base, fontSize: 13, minWidth: 130, padding: '0px 2px' })
}
