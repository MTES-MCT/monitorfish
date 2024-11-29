import styled from 'styled-components'

export const SkeletonRow = styled.div`
  height: 30px;
  position: relative;
  overflow: hidden;
  background: ${p => p.theme.color.gainsboro};
  &:before {
    content: '';
    display: block;
    position: absolute;
    left: -150px;
    top: 0;
    height: 100%;
    width: 150px;
    background: linear-gradient(to right, transparent 0%, ${p => p.theme.color.white} 50%, transparent 100%);
    animation: load 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
  @keyframes load {
    from {
      left: -150px;
    }
    to {
      left: 100%;
    }
  }
`
