import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export const TableBody = styled.tbody``

export const Zone = styled.div`
  background: ${p => p.theme.color.white};
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  padding: 10px 16px;
  text-align: left;
`

export const Table = styled.table`
  display: table;
  margin: 0;
  min-width: 40%;
  width: inherit;
`

export const TableRow = styled.tr`
  font-size: 13px;
  line-height: 21px;
`

export const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  display: inline-block;
  font-weight: 300;
  line-height: normal;
`

export const TableKey = styled.th`
  background: none;
  border: none;
  color: ${p => p.theme.color.slateGray};
  display: inline-block;
  font-weight: normal;
  max-width: 190px;
`

export const TableValue = styled.td`
  background: none;
  border: none;
  color: ${p => p.theme.color.gunMetal};
  padding-left: 12px;
  text-align: left;
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
  control: base => ({
    ...base,
    borderColor: THEME.color.lightGray,
    borderRadius: 'unset',
    fontSize: 13,
    minHeight: 26
  }),
  dropdownIndicator: base => ({ ...base, padding: 1, width: 18 }),
  input: () => ({ margin: 0, padding: 0 }),
  menu: base => ({ ...base, margin: 0, maxHeight: 360, padding: 0 }),
  menuList: base => ({ ...base, maxHeight: 360 }),
  menuPortal: base => ({ ...base, zIndex: 9999 }),
  multiValue: base => ({ ...base, background: THEME.color.gainsboro, borderRadius: 12, fontSize: 13 }),
  multiValueLabel: base => ({
    ...base,
    background: THEME.color.gainsboro,
    borderRadius: 12,
    color: THEME.color.slateGray,
    paddingBottom: 1,
    paddingTop: 2
  }),
  multiValueRemove: base => ({
    ...base,
    '&:hover': {
      backgroundColor: THEME.color.blueYonder25,
      color: THEME.color.blueYonder
    },
    background: THEME.color.gainsboro,
    borderRadius: 12,
    color: THEME.color.slateGray
  }),
  option: base => ({ ...base, fontSize: 13 }),
  placeholder: base => ({ ...base, fontSize: 13 }),
  singleValue: base => ({ ...base, fontSize: 13 }),
  valueContainer: base => ({ ...base, fontSize: 13, minWidth: 130, padding: '0px 2px' })
}
