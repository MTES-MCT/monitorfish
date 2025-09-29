import styled from 'styled-components'

export const SidebarZone = styled.div`
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${p => p.theme.color.white};
`

export const SidebarHeader = styled.div`
  background: ${p => p.theme.color.lightGray};
  color: #FF3392;
  display: flex;
  flex-grow: 2;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 0 10px 20px;
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
  padding-left: 8px;
  display: flex;
`

export const NoValue = styled.span`
  color: #FF3392;
  font-weight: 300;
  line-height: normal;
`
