import styled from "styled-components";
import {NoRsuiteOverrideWrapper} from "../../../../ui/NoRsuiteOverrideWrapper";

export namespace PageWithUnderlineTitle {
  export const Wrapper = styled(NoRsuiteOverrideWrapper)`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  width: 100%;
  overflow-y: auto;
`

  export const Header = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.white};
  border-bottom: solid 2px ${p => p.theme.color.gainsboro};
  display: flex;
  min-height: 80px;
  justify-content: space-between;
  padding: 0 40px 0 40px;
`

  export const HeaderTitle = styled.h1`
  color: ${p => p.theme.color.charcoal};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
`

  export const HeaderButtonGroup = styled.div`
  display: flex;

  > button:not(:first-child) {
    margin-left: 16px;
  }
`

  export const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px 40px 0 40px;
`
}
