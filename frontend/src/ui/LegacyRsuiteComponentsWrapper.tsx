import styled from 'styled-components'

export const LegacyRsuiteComponentsWrapper = styled.div<{
  overrideCheckbox?: boolean
}>`
  height: 100%;
  width: 100%;

  /*****************************************************************************
    Legacy Rsuite custom CSS
  */

  /* From index.css */

  .rs-modal-lg {
    width: 1300px;
  }

  .rs-slider-mark {
    font-size: 13px;
    color: #707785;
  }

  .rs-slider {
    position: absolute;
    width: 341px;
    margin-top: -19px;
  }

  .rs-slider-bar {
    height: 0;
  }

  .rs-slider-progress-bar {
    height: 2px;
    background: none;
  }

  .rs-slider-graduator > ol > li::before {
    visibility: hidden;
  }

  .rs-slider-graduator > ol > li:last-child::after,
  .rs-slider-graduator > ul > li::before {
    top: -3px;
    border: none;
  }

  .rs-slider-handle::before {
    background: #cccfd6;
    border: unset;
    top: -6px;
    margin-left: -5px;
    width: 16px;
    height: 16px;
  }

  .rs-slider-graduator {
    margin-left: -5px;
    margin-top: -10px;
  }

  .rs-slider-graduated > div:nth-child(2)::before {
    background: #9095a2;
    z-index: 99;
  }

  .rs-slider-graduated > div:nth-child(2) {
    z-index: 9999;
  }

  .rs-slider-graduated > div:nth-child(3)::before {
    background: #3b4559;
    z-index: 99;
  }

  .rs-picker-menu {
    z-index: 9999 !important;
  }

  .rs-picker-default:not(.rs-picker-disabled) .rs-btn:hover,
  .rs-picker-default:not(.rs-picker-disabled) .rs-picker-toggle:hover,
  .rs-picker-default:not(.rs-picker-disabled) .rs-btn.active,
  .rs-picker-default:not(.rs-picker-disabled) .rs-picker-toggle.active {
    border-color: #707785 !important;
  }

  .rs-table:not(.rs-table-column-resizing) .rs-table-cell-header .rs-table-cell:hover ~ .rs-table-column-resize-spanner,
  .rs-table:not(.rs-table-column-resizing) .rs-table-column-resize-spanner:hover {
    background-color: #707785;
  }

  .rs-table-column-resize-spanner::before {
    border-color: transparent #707785 transparent transparent;
  }

  .rs-calendar-table-cell-is-today .rs-calendar-table-cell-content {
    border: 1px solid #707785 !important;
  }

  .rs-picker-toggle.rs-btn-sm {
    border-radius: 2px !important;
  }

  .rs-calendar,
  .rs-calendar-header,
  .rs-calendar-table-cell-content {
    box-sizing: border-box !important;
  }

  .rs-calendar-table-cell-content {
    border-radius: 2px !important;
  }

  .rs-calendar-table-cell-selected .rs-calendar-table-cell-content {
    color: #f0f0f0;
    border-color: #3b4559;
    background-color: #3b4559;
  }

  .rs-calendar-table-cell-in-range::before {
    background-color: #e0e0e0;
  }

  .rs-picker-toolbar-right-btn-ok {
    padding: 5px 10px;
    font-size: 13px;
    line-height: 1.42857143;
    border-radius: 2px;
    color: #fff;
    background-color: #3b4559;
  }

  .rs-picker-toolbar-right-btn-ok.rs-picker-toolbar-btn-disabled,
  .rs-picker-toolbar-right-btn-ok.rs-picker-toolbar-btn-disabled:hover,
  .rs-picker-toolbar-right-btn-ok.rs-picker-toolbar-btn-disabled:hover:active {
    background-color: #3b4559;
  }

  .rs-picker-toolbar-right-btn-ok:not(.rs-btn-disabled):hover {
    background-color: #3b4559;
  }

  .rs-input-group.rs-input-group-inside .rs-input-group-addon {
    padding: 8px 13px 8px 11px;
  }

  .rs-input {
    color: #707785;
  }

  .rs-modal-body {
    padding: 20px 25px 0 25px !important;
  }

  /* From App.css */

  .checkbox-hidden > div > label > .rs-checkbox-wrapper {
    opacity: 0 !important;
    margin-left: -40px;
    position: inherit;
  }

  .rs-table-body-info {
    font-size: 13px;
    color: #707785;
  }

  .rs-modal-full .rs-modal-dialog {
    width: 100%;
    margin-left: 0;
  }

  .rs-modal-content {
    padding: 0;
    border-radius: 2px;
  }

  .rs-modal-body {
    padding: 20px 25px 20px 25px;
    margin-top: 0;
    max-height: 800px !important;
    min-height: 210px !important;
  }

  .rs-table-cell-header,
  .rs-table-cell[role='columnheader'],
  .rs-table-cell-header:focus,
  .rs-table-cell[role='columnheader']:focus,
  .rs-table-cell-header:hover,
  .rs-table-cell[role='columnheader']:hover {
    background: #e5e5eb;
    color: white;
  }

  .rs-table-hover .rs-table-row-header:hover .rs-table-cell-group,
  .rs-table-hover .rs-table-row-header:hover .rs-table-cell {
    background: #e5e5eb;
  }

  .rs-table-cell[role='columnheader'] > .rs-table-cell-content {
    color: #707785;
  }

  .rs-table-cell {
    border: 1px solid #e0e0e0;
  }

  .rs-table-cell-content {
    font-size: 13px;
    font-weight: 500;
    color: #282f3e;
    padding: 9px 7px;
    text-align: left;
  }

  .rs-table-cell-content > input {
    border: none;
    width: inherit;
    background: none;
    padding-left: 15px;
    font-size: 13px;
    font-weight: normal;
    color: #282f3e;
  }

  .rs-table-scrollbar-handle,
  .rs-table-scrollbar-handle:hover,
  .rs-table-scrollbar-handle:focus {
    position: absolute;
    background-color: #575757;
    border-radius: 4px;
  }

  .rs-picker-default .rs-btn,
  .rs-picker-input .rs-btn,
  .rs-picker-default .rs-picker-toggle,
  .rs-picker-input .rs-picker-toggle {
    background: unset !important;
  }

  .rs-picker-tag-wrapper {
    padding-bottom: 0;
    min-height: 30px;
  }

  .rs-picker-input {
    vertical-align: top;
    border-radius: 2px;
  }

  .rs-picker-toggle {
    border-radius: 2px;
  }

  .rs-picker-toggle-placeholder {
    font-size: 11px;
    color: #707785 !important;
  }

  .rs-picker-has-value .rs-btn .rs-picker-toggle-value,
  .rs-picker-has-value .rs-picker-toggle .rs-picker-toggle-value {
    color: #707785;
    font-size: 13px;
    font-weight: normal;
  }

  .rs-picker-tag > .rs-picker-toggle {
    width: 105px;
  }

  .rs-picker-select-menu-item.rs-picker-select-menu-item-active,
  .rs-picker-select-menu-item.rs-picker-select-menu-item-active:hover,
  .rs-picker-select-menu-item:not(.rs-picker-select-menu-item-disabled):hover,
  .rs-picker-select-menu-item.rs-picker-select-menu-item-focus,
  .rs-picker-select-menu-item {
    color: #707785;
    font-size: 13px;
    font-weight: normal;
    max-width: 600px;
  }

  .grouped .rs-picker-select-menu-item {
    padding-left: 0px;
  }

  .rs-picker-select-menu-items.rs-picker-select-menu-group.rs-picker-select-menu-group-title {
    font-size: 13px;
    color: #707785;
  }

  .rs-picker-toggle-clean,
  .rs-picker-toggle-caret {
    color: #707785;
  }

  .rs-picker-check-menu {
    width: 280px;
  }

  .rs-picker-tag .rs-tag {
    max-width: calc(100% - 25px) !important;
  }

  .rs-picker-check-menu-group[role='listitem'] {
    height: 48px !important;
  }

  .rs-picker-check-menu-items .rs-picker-check-menu-group:not(:first-child) {
    padding-top: 0px !important;
  }

  .rs-table-cell-header .rs-table-cell-content {
    padding: 10px 7px;
  }

  .rs-table-hover .rs-table-row:not(.rs-table-row-header):hover,
  .rs-table-hover .rs-table-row:hover .rs-table-cell-group,
  .rs-table-hover .rs-table-row:hover .rs-table-cell {
    background: #d4dde7 !important; /* blueYonder 25 */
  }

  .rs-table-cell,
  .rs-table-cell-group,
  .rs-table-row {
    -webkit-transition: background-color 0.1s linear !important;
    transition: background-color 0.1s linear !important;
  }

  .new-regulation-select-picker a {
    padding: 8px 0px;
  }

  .rs-table-row-expanded {
    height: 100px !important;
    background: white !important;
  }

  .hover-border:hover {
    border-bottom: 1px solid rgb(40, 47, 62);
    box-sizing: border-box;
  }

  .rs-btn-primary:hover {
    color: inherit;
  }

  /*****************************************************************************
    Fixes following mointor-ui v12 upgrade (including Rsuite breaking changes)
  */

  .rs-picker {
    border-radius: 0;
    font-size: 13px;
    width: 100%;

    * {
      font-size: 13px;
    }

    [role='combobox'] {
      width: 100%;
    }

    .rs-picker-toggle-placeholder {
      font-size: 11px;
    }
  }

  ${p =>
    p.overrideCheckbox
      ? `.rs-checkbox {
    .rs-checkbox-checker {
      min-height: 0;

      .rs-checkbox-wrapper {
        .rs-checkbox-inner {
          &:before {
            background-color: ${p.theme.color.gainsboro} !important;
            border: solid 2px ${p.theme.color.lightGray} !important;
            border-radius: 0;
          }
        }
      }

      &.rs-checkbox-checked {
        .rs-checkbox-wrapper {
          .rs-checkbox-inner {
            &:before {
              background-color: ${p.theme.color.charcoal} !important;
              border: solid 2px ${p.theme.color.charcoal} !important;
            }
          }
        }
      }
    }
  }`
      : ''}

  .rs-picker {
    width: auto;
  }

  .rs-picker-popup {
    z-index: 9999;
  }
`
