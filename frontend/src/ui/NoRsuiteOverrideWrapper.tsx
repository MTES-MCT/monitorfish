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
  /*
    This is the closest to as round 18px we can get because 13px can't produce round line heights (other than 1),
    leading to regular cascaded height issues, especially on HD screens (2 or more real pixels per theoric pixel)
  */
  line-height: 1.3846;

  * {
    box-sizing: border-box;
    line-height: 1.3846;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
  }

  .rs-checkbox {
    > .rs-checkbox-checker {
      > label {
        line-height: 1.5384; // = 20px
      }
    }
  }

  .rs-picker-check-menu {
    width: auto;
  }

  .rs-picker-select {
    height: 36px;

    > .rs-picker-toggle {
      padding-bottom: 7px;
      width: 100%;

      > .rs-stack {
        > .rs-stack-item {
          > .rs-picker-toggle-value {
          }

          > .rs-picker-toggle-clean {
            line-height: 1;
            padding: 4.5px 0 3.5px;
          }
        }
      }
    }

    > .rs-picker-tag-wrapper {
      min-height: 29px;

      > .rs-tag {
        margin-top: 6px !important;

        > .rs-btn-close {
          line-height: 1;
          padding: 5px 6px 7px;
        }
      }
    }
  }

  .rs-picker-tag {
    * {
      font-size: 13px;
    }

    > .rs-picker-toggle {
      height: 30px;
      width: 100%;

      > .rs-stack {
        > .rs-stack-item {
          font-size: 13px;

          > .rs-picker-togggle-textbox {
            font-size: 13px;
            line-height: 1.125;
          }

          > .rs-picker-togggle-placeholder {
            font-size: 13px;
            line-height: 1.125;
          }

          > .rs-picker-toggle-clean {
            line-height: 1;
            top: 8px;

            &:hover {
              top: 4px;
            }
          }
        }
      }
    }

    > .rs-picker-tag-wrapper {
      min-height: 30px;

      > .rs-tag {
        font-size: 11px;
        line-height: 1.3636; // = 15px
        margin-top: 6px !important;

        > span {
          font-size: 11px !important;
          line-height: 1.3636; // = 15px
        }

        > .rs-tag-icon-close {
          > svg {
            height: 10px;
            width: 10px;
          }
        }
      }
    }
  }

  .rs-radio {
    > .rs-radio-checker {
      > label {
        line-height: 1.5384; // = 20px

        > .rs-radio-wrapper {
          > .rs-radio-inner {
            &:after {
              height: 9px;
              margin-left: 4px;
              margin-top: 3.5px;
              width: 9px;
            }
          }
        }
      }
    }
  }
`
