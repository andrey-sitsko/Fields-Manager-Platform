import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Home } from './home/home';
import { AddField } from './add-field/add-field';
import { FieldDetails } from './field-details/field-details';
import { MyFields } from './my-fields/my-fields';
import { MyResources } from './my-resources/my-resources';
import { PhotoDetails } from './photo-details/photo-details';
import { Statistics } from './statistics/statistics';

// - Home page
// - My fields page (with empty state)
// - Adding new field form
// - Specific field page (with set of marks - photos)
// - Specific photo page (statistics, switching between site-modules, switching between original/weak parts/multispectral)
// - Overal statistics of all users fields
// - My resources (meteostations, drones and other techincs, staff, fertilizers)
// - Settings
// - Profile

export default function AppRoute() {
  return (
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/add-field" exact component={AddField} />
      <Route path="/field-details/:id" exact component={FieldDetails} />
      <Route path="/my-fields" exact component={MyFields} />
      <Route path="/my-resources" exact component={MyResources} />
      <Route path="/photo-details/:id" exact component={PhotoDetails} />
      <Route path="/statistics" exact component={Statistics} />
    </Switch>
  );
}
