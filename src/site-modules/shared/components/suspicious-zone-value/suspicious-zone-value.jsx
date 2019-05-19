import React, { Fragment } from 'react';
import { Card } from '../card/card';

import './suspicious-zone-value.scss';

const ALARM_THRESHOLD = 20;

export function SuspiciousZoneValue({ percents }) {
  return percents < ALARM_THRESHOLD ? <div>{percents}%</div> : 
  <Fragment>
    <div className="text-red limit-toggle"><i className="icon icon-warning" /> {percents}%</div>
    <Card className="limit-tooltip">
      Square of suspicious zones exceeds limit. You can specify limit in settings. 
    </Card>
  </Fragment>
}