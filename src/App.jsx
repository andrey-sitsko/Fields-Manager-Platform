import React, { Fragment } from 'react'
import AppRoute from './site-modules/_routes'
import { Router } from 'react-router-dom'
import './App.scss'
import './icons.scss'
import { Map } from './site-modules/shared/components/map/map'

function App({history}) {
  return (
    <Fragment>
      <Router history={history}>
        <AppRoute />
      </Router>
      <Map/>
      <div className="nav-overlay" />
    </Fragment>
  );
}

export default App;
