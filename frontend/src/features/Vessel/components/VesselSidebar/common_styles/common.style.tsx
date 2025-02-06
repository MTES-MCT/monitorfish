import styled from 'styled-components'

export const SidebarZone = styled.div`
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${p => p.theme.color.white};
`

export const SidebarHeader = styled.div`
  background: ${p => p.theme.color.lightGray};
  color: ${p => p.theme.color.slateGray};
  display: flex;
  flex-grow: 2;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 10px 10px 20px;
  width: 400px;
  vertical-align: middle;
  user-select: none;
  height: 18px;
`

export const SidebarLoadMoreYears = styled.div`
  background: ${p => p.theme.color.white};
  padding: 5px 0 5px 0;
  text-align: center;
  width: 100%;
`

export const SidebarHeaderValue = styled.div<{
  $hasTwoLines?: boolean
}>`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  padding-left: 12px;
`

export const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
`
