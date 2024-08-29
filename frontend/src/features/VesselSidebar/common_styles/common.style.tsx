import styled from 'styled-components'

export const Zone = styled.div`
  margin: 10px 5px 0 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${p => p.theme.color.white};
`

export const Header = styled.div`
  background: ${p => p.theme.color.lightGray};
  color: ${p => p.theme.color.slateGray};
  display: flex;
  flex-grow: 2;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 10px 9px 20px;
  width: 400px;
  vertical-align: middle;
  user-select: none;
`

export const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
`

export const StrongText = styled.span`
  color: ${p => p.theme.color.gunMetal};
  margin-left: 5px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  max-width: 200px;
  display: inline-block;
  vertical-align: top;
  font-weight: 500;
`
