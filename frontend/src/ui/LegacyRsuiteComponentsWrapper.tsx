import styled from 'styled-components'

export const LegacyRsuiteComponentsWrapper = styled.div`
  /*****************************************************************************
    Legacy Rsuite custom CSS
  */

  /* From index.css */

  .rs-modal-lg {
    width: 1300px;
  }

  .rs-slider-mark {
    font-size: 13px;
    color: ${p => p.theme.color.slateGray};
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
    background: ${p => p.theme.color.lightGray};
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
    background: ${p => p.theme.color.charcoal};
    z-index: 99;
  }

  .rs-picker-menu {
    z-index: 9999 !important;
  }

  .rs-picker-default:not(.rs-picker-disabled) .rs-btn:hover,
  .rs-picker-default:not(.rs-picker-disabled) .rs-picker-toggle:hover,
  .rs-picker-default:not(.rs-picker-disabled) .rs-btn.active,
  .rs-picker-default:not(.rs-picker-disabled) .rs-picker-toggle.active {
    border-color: ${p => p.theme.color.slateGray} !important;
  }

  .rs-table:not(.rs-table-column-resizing) .rs-table-cell-header .rs-table-cell:hover ~ .rs-table-column-resize-spanner,
  .rs-table:not(.rs-table-column-resizing) .rs-table-column-resize-spanner:hover {
    background-color: ${p => p.theme.color.slateGray};
  }

  .rs-table-column-resize-spanner::before {
    border-color: transparent ${p => p.theme.color.slateGray} transparent transparent;
  }

  .rs-calendar-table-cell-is-today .rs-calendar-table-cell-content {
    border: 1px solid ${p => p.theme.color.slateGray} !important;
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
    border-color: ${p => p.theme.color.charcoal};
    background-color: ${p => p.theme.color.charcoal};
  }

  .rs-calendar-table-cell-in-range::before {
    background-color: #e0e0e0;
  }

  .rs-picker-toolbar-right-btn-ok {
    padding: 5px 10px;
    font-size: 13px;
    line-height: 1.42857143;
    border-radius: 2px;
    color: ${p => p.theme.color.white};
    background-color: ${p => p.theme.color.charcoal};
  }

  .rs-picker-toolbar-right-btn-ok.rs-picker-toolbar-btn-disabled,
  .rs-picker-toolbar-right-btn-ok.rs-picker-toolbar-btn-disabled:hover,
  .rs-picker-toolbar-right-btn-ok.rs-picker-toolbar-btn-disabled:hover:active {
    background-color: ${p => p.theme.color.charcoal};
  }

  .rs-picker-toolbar-right-btn-ok:not(.rs-btn-disabled):hover {
    background-color: ${p => p.theme.color.charcoal};
  }

  .rs-input-group.rs-input-group-inside .rs-input-group-addon {
    padding: 8px 13px 8px 11px;
  }

  .rs-modal-body {
    padding: 20px 25px 0 25px !important;
  }

  /* From App.css */

  .checkbox-hidden > div > label > .rs-checkbox-checker {
    opacity: 0 !important;
    margin-left: -40px;
    position: inherit;
  }

  .rs-table-body-info {
    font-size: 13px;
    color: ${p => p.theme.color.slateGray};
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
    background: ${p => p.theme.color.gainsboro};
    color: white;
  }

  .rs-table-hover .rs-table-row-header:hover .rs-table-cell-group,
  .rs-table-hover .rs-table-row-header:hover .rs-table-cell {
    background: ${p => p.theme.color.gainsboro};
  }

  .rs-table-cell[role='columnheader'] > .rs-table-cell-content {
    color: ${p => p.theme.color.slateGray};
  }

  .rs-table-cell {
    border: 1px solid #e0e0e0;
  }

  .rs-table-cell-content {
    font-size: 13px;
    font-weight: 500;
    color: ${p => p.theme.color.gunMetal};
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
    color: ${p => p.theme.color.gunMetal};
  }

  .rs-table-scrollbar-handle,
  .rs-table-scrollbar-handle:hover,
  .rs-table-scrollbar-handle:focus {
    position: absolute;
    background-color: #575757;
    border-radius: 4px;
  }

  .rs-picker-tag > .rs-picker-toggle {
    width: 105px;
  }

  .rs-picker-select-menu-item.rs-picker-select-menu-item-active,
  .rs-picker-select-menu-item.rs-picker-select-menu-item-active:hover,
  .rs-picker-select-menu-item:not(.rs-picker-select-menu-item-disabled):hover,
  .rs-picker-select-menu-item.rs-picker-select-menu-item-focus,
  .rs-picker-select-menu-item {
    color: ${p => p.theme.color.slateGray};
    font-size: 13px;
    font-weight: normal;
    max-width: 600px;
  }

  .grouped .rs-picker-select-menu-item {
    padding-left: 0px;
  }

  .rs-picker-select-menu-items.rs-picker-select-menu-group.rs-picker-select-menu-group-title {
    font-size: 13px;
    color: ${p => p.theme.color.slateGray};
  }

  .rs-picker-toggle-clean,
  .rs-picker-toggle-caret {
    color: ${p => p.theme.color.slateGray};
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
    background: ${p => p.theme.color.blueYonder25} !important;
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
    border-bottom: 1px solid ${p => p.theme.color.gunMetal};
    box-sizing: border-box;
  }

  .rs-btn-primary:hover {
    color: inherit;
  }
`
