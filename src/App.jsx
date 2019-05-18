import React from 'react';
import AppRoute from './site-modules/_routes'
import { Router } from 'react-router-dom'
import './App.scss'
import './icons.scss'

function App({history}) {
  return (
    <div>
      <Router history={history}>
        <AppRoute />
      </Router>
    </div>
  );
}

export default App;
