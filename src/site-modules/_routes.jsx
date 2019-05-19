import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Home } from './home/home';
import { AddField } from './add-field/add-field';
import { FieldDetails } from './field-details/field-details';
import { MyFields } from './my-fields/my-fields';
import { MyResources } from './my-resources/my-resources';
import { PhotoDetails } from './photo-details/photo-details';
import { Statistics } from './statistics/statistics';
import { Navigation } from './shared/components/navigation/navigation';

export default function AppRoute() {
  return (
    <Fragment>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/my-fields/add-field" exact component={AddField} />
        <Route path="/my-fields/field-details/:fieldId" exact component={FieldDetails} />
        <Route path="/my-fields" exact component={MyFields} />
        <Route path="/my-resources" exact component={MyResources} />
        <Route path="/my-fields/field-details/:fieldId/photo-details/:photoId" exact component={PhotoDetails} />
        <Route path="/statistics" exact component={Statistics} />
      </Switch>
      <Switch>
        <Route path="/" component={Navigation} />
      </Switch>
    </Fragment>
  );
}
