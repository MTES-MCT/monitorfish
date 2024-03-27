import styled from 'styled-components'

/**
 * Attempt to cancel and hack local `rsuite-override.css` effects.
 *
 * @description
 * The main issues with the legacy local CSS are:
 *
 * - The strange `box-sizing` in `index.css` while it should be `border-box;`:
 *
 * ```css
 * * {
 *   -webkit-box-sizing: revert;
 *   box-sizing: revert;
 * }
 * ```
 *
 * - The unconventional `font-size` in `rsuite-override.css` while it should be `16px`
 *   whatever is picked default font-size and then adapted on a component basis (with 13px wrappers for example):
 *
 * ```css
 * html {
 *   font-size: 16px;
 * }
 * ```
 */
// TODO Fix these CSS issues.
export const NoRsuiteOverrideWrapper = styled.div`
  box-sizing: border-box;

  .Field-Checkbox * {
    line-height: 18px;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
  }
`
