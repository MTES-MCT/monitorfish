import styled from 'styled-components'

export const FormBody = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 0 40px 32px 40px;

  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 16px;
  }

  hr {
    background: ${p => p.theme.color.slateGray};
    height: 1px;
    margin: 24px 0 0;
    /* Otherwise it "mysteriously disappears" since it's in an horizontal flex context */
    min-height: 1px;
  }

  /* TODO Normalize that in monitor-ui (check with Adeline). Maybe Size.NORMAL vs Size.LARGE? + Auto-Resize. */
  .Field-Textarea {
    textarea {
      resize: vertical;
    }
  }

  .Field-TextInput {
    input[name='userTrigram'] {
      width: 120px;
    }
  }
`

export const FormBodyInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 384px;

  > div:not(:first-child),
  > fieldset:not(:first-child) {
    margin-top: 24px;
  }

  hr {
    background: ${p => p.theme.color.slateGray};
    height: 2px;
    margin: 24px 0 0;
    /* Otherwise it "mysteriously disappears" since it's in an horizontal flex context */
    min-height: 2px;
  }
`
