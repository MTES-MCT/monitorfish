import { createGlobalStyle } from 'styled-components'

export const CustomGlobalStyle = createGlobalStyle`
  body,
  html,
  * {
    margin: 0;
    font-family:
      'Marianne',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-size: 13px;
    }

  html,
  body,
  #root {
    height: 100%;
  }

  #root {
    font-size: 13px;
  }

  /* TODO Attempt to progressively migrate to "box-sizing: border-box" everywhere. */
  * {
    -webkit-box-sizing: revert;
    box-sizing: revert;
    scrollbar-width: thin; /* Firefox */

    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar-track {
      background-color: ${p => p.theme.color.lightGray};
    }
    &::-webkit-scrollbar-thumb {
      background-color: ${p => p.theme.color.slateGray};
    }
  }

  *::before,
  *::after {
    -webkit-box-sizing: revert;
    box-sizing: revert;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }

  .noUi-origin {
    visibility: hidden;
  }

  .available-width {
    width: -webkit-fill-available !important;
    width: -moz-available !important;
    width: stretch;
  }

  .noUi-target {
    background: none;
    border-radius: unset;
    border: none;
    box-shadow: none;
  }

  .noUi-connects {
    border-radius: 0;
    border: none;
    height: 3px;
  }

  .noUi-connect:nth-child(1) {
    background: #cccfd6;
  }

  .noUi-connect:nth-child(2) {
    background: #9095a2;
  }

  .noUi-connect:nth-child(3) {
    background: #3b4559;
  }

  button,
  [type='button'],
  [type='submit'],
  [type='reset'],
  a.button,
  label.button,
  .button,
  a[role='button'],
  label[role='button'],
  [role='button'],
  [role='button']:hover,
  [role='button']:focus {
    background: unset;
    color: unset;
    border: unset;
    text-decoration: unset;
    border-radius: unset;
    margin: unset;
    padding: unset;
  }

  label {
    padding: unset;
  }

  @-webkit-keyframes pulse {
    0% {
      -webkit-box-shadow: 0 0 0 0 rgba(81, 81, 81, 0.4);
    }
    70% {
      -webkit-box-shadow: 0 0 0 10px rgba(81, 81, 81, 0);
    }
    100% {
      -webkit-box-shadow: 0 0 0 0 rgba(81, 81, 81, 0);
    }
  }
  @keyframes pulse {
    0% {
      -moz-box-shadow: 0 0 0 0 rgba(81, 81, 81, 0.4);
      box-shadow: 0 0 0 0 rgba(81, 81, 81, 0.4);
    }
    70% {
      -moz-box-shadow: 0 0 0 10px rgba(81, 81, 81, 0);
      box-shadow: 0 0 0 10px rgba(81, 81, 81, 0);
    }
    100% {
      -moz-box-shadow: 0 0 0 0 rgba(81, 81, 81, 0);
      box-shadow: 0 0 0 0 rgba(81, 81, 81, 0);
    }
  }

  /*******************************************************************************
    CSS & Components Normalization WIP

    Temporary CSS hacks to fix some components while we progressively normalize the application CSS & components.

    IMPORTANT: Try to scope CSS hacks to ease transition and make them easier to remove.
  */

  .boat {
    object-position: 0 -234px;
  }

  body > iframe {
    display: none;
  }

  html {
    overflow-y: hidden;
    overflow-x: hidden;
    font-size: 13px;
    scroll-behavior: smooth;
  }

  .smooth-scroll {
    scroll-behavior: smooth;
  }

  .overlay-active {
    z-index: 999999999;
  }

  .vessel-card {
    z-index: 9999999999;
  }

  .mission-control-overlay {
    z-index: 999999999;
  }

  .selected-mission-card {
    z-index: 99999999999;
  }

  .menu-overlay {
    z-index: 999999999999;
  }

  .zoom {
    bottom: 38px;
    left: 0.5em;
    width: 25px;
    height: 53px;
  }

  .zoom > button {
    width: 25px;
    height: 25px;
  }

  .checkbox-hidden > div > label > .rs-checkbox-wrapper {
    opacity: 0 !important;
    margin-left: -40px;
    position: inherit;
  }

  .collapsed {
    display: none;
  }

  .ol-attribution ul {
    text-shadow: none;
  }

  .ol-control button {
    background-color: #3b4559;
  }

  .ol-control {
    background: none;
  }

  .ol-control:hover {
    background: inherit;
  }

  .ol-control button,
  .ol-control button:hover,
  .ol-control button:focus {
    background-color: #3b4559;
    border-radius: 2px;
    font-size: 15px;
    padding-bottom: 5px;
  }

  .hide {
    display: none;
  }

  .visible {
    visibility: visible;
  }

  .active-tab {
    background-color: #707785;
  }

  .rs-table-body-info {
    font-size: 13px;
    color: #707785;
  }

  table:not(.horizontal) th,
  table:not(.horizontal) td {
    overflow: unset;
    flex: unset;
  }

  table th,
  table td {
    padding: unset;
  }

  table tr {
    display: table-row;
  }

  .primary {
    background: rgba(5, 5, 94, 1);
  }

  tbody {
    display: contents !important;
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    font-size: 100%;
    vertical-align: baseline;
    background: transparent;
  }

  .radar {
    position: initial !important;
    display: block;
    margin-top: 300px;
  }

  .update-vessels .fingerprint-spinner {
    border: 1px solid transparent !important;
    border-top-color: #3b4559 !important;
  }

  .update-vessels > .spinner-ring {
    border: 1px solid transparent !important;
    border-top-color: #3b4559 !important;
  }

  a:focus {
    outline: none;
  }

  button:focus {
    outline: none;
  }

  input:focus {
    outline: none;
  }

  .highlight {
    margin: 0;
    padding: 0;
    background-color: #cccfd6;
    color: rgb(81, 81, 81);
  }

  input:not([type]),
  [type='text'],
  [type='email'],
  [type='number'],
  [type='search'],
  [type='password'],
  [type='url'],
  [type='tel'],
  [type='checkbox'],
  [type='radio'],
  textarea,
  select {
    margin: 0;
    padding: 0;
  }

  .ol-scale-line {
    position: absolute;
    bottom: 10px;
    left: 282px;
    display: inline-block;
    margin: 1px;
    padding: 2px 0 5px 2px;
    color: white;
    font-size: 0.9em;
    text-decoration: none;
    text-align: center;
    height: 18px;
    background-color: #3b4559;
    border: none;
    border-radius: 2px;
  }

  .ol-scale-line-inner {
    margin: 3px 4px 4px 2px;
    line-height: 11px;
    padding-bottom: 4px;
  }

  a:hover,
  a:focus {
    color: #282f3e;
  }

  .base-layers-selection > .rs-radio > .rs-radio-checker > label > .rs-radio-wrapper {
    float: right;
    position: relative;
    top: 0;
    margin-bottom: 9px;
    margin-left: 180px;
  }

  .base-layers-selection > .rs-radio > .rs-radio-checker {
    padding-left: 0;
    padding-top: 3px;
  }

  .base-layers-selection > .rs-radio > .rs-radio-checker > label {
    width: 304px;
    display: inline-block;
    font-weight: 500;
  }

  .new-regulation-select-picker a {
    padding: 8px 0px;
  }

  .ol-attribution ul {
  text-shadow: none;
}

  .ol-control button {
    background-color: #3B4559;
    color: var(--gainsboro);
  }

  .ol-control {
    background: none;
  }

  .ol-control:hover {
    background: inherit;
  }

  .ol-control button,
  .ol-control button:hover,
  .ol-control button:focus {
    background-color: #3B4559;
    border-radius: 2px;
    font-size: 15px;
    padding-bottom: 5px;
  }

  .ol-scale-line {
    box-sizing: content-box;
    position: absolute;
    bottom: 10px;
    left: 282px;
    display: inline-block;
    margin: 1px;
    padding: 2px 0 5px 2px;
    font-size: 0.9em;
    text-decoration: none;
    text-align: center;
    height: 18px;
    background-color: #3B4559;
    border: none;
    border-radius: 2px;
  }

  .ol-scale-line-inner {
    color: var(--lightGray);
    margin: 3px 4px 4px 2px;
    line-height: 11px;
    padding-bottom: 4px;
  }

  .ol-control.zoom {
    bottom: 38px;
    left: .5em;
    width: 25px;
    height: 53px;
  }

  .ol-control.zoom>button {
    width: 25px;
    height: 25px;
  }

  .rs-picker-popup {
    border-radius: 0;
    font-size: 13px;
    z-index: 9999;
  }
`
