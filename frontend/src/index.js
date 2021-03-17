import React from 'react';
import ReactDOM from 'react-dom';
import 'rsuite/dist/styles/rsuite-default.css';
import 'mini.css';
import "nouislider/distribute/nouislider.css";
import './index.css';
import 'ol/ol.css';
import './App.css';

import App from './App';
import { Provider } from 'react-redux'
import Store from "./Store";
import GlobalFonts from "./fonts/fonts";

ReactDOM.render(
  <React.StrictMode>
      <Provider store={Store}>
          <GlobalFonts/>
          <App />
      </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);