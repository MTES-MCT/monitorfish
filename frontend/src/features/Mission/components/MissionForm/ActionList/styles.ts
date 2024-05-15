import styled from 'styled-components'

export const ActionLabel = styled.div`
  display: flex;
  flex-grow: 1;

  > .Element-IconBox {
    margin-right: 8px;
  }

  > p {
    margin-top: 0px;
    color: ${p => p.theme.color.gunMetal};
    padding: 1px 0px 0 0;
    min-height: 26px;
  }
`

export const Head = styled.div`
  align-items: flex-start;
  display: flex;

  /* TODO Remove the padding if iconSize is set in monitor-ui. */
  > button {
    padding: 0;
  }
`

export const NoteContent = styled.div`
  color: ${p => p.theme.color.gunMetal};
  font: normal normal normal 14px/20px Marianne;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  flex: 1;
`
