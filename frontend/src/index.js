import React from 'react';
import ReactDOM from 'react-dom';
import 'rsuite/dist/styles/rsuite-default.css';
import 'mini.css';
import './index.css';
import App from './App';
import { Provider } from 'react-redux'
import Store from "./Store";

ReactDOM.render(
  <React.StrictMode>
      <Provider store={Store}>
        <App />
      </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);