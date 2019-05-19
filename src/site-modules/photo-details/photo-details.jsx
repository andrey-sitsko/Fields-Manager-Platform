import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Button from 'reactstrap/lib/Button';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import { Card } from '../shared/components/card/card';
import { SuspiciousZoneValue } from '../shared/components/suspicious-zone-value/suspicious-zone-value';

import './photo-details.scss';

const MOCK_PHOTO = {
  id: 'p1',
  fieldName: 'Wheat',
  date: new Date('April 17, 2019 13:24:00'),
  originalSrc: 'https://s3.amazonaws.com/epam-jam1/images/DJI_0098.JPG',
  mask: [],
  square: 5.6,
  suspiciousZone: 59,
  lat: 51.520173035107824,
  lng: -0.08995056153243751,
}

const TYPE_MAP = {
  ORIGINAL: 'Original',
  LABEL: 'Label visualization',
  MULTISPECTRAL: 'Multispectral',
}

export class PhotoDetails extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }),
    }),
  };

  constructor(props) {
    super(props);

    this.state = {
      data: null,
      photoType: TYPE_MAP.ORIGINAL,
    };
  }
  
  componentDidMount() {
    // fetch photo details
    this.setState({
      data: MOCK_PHOTO,
    });
  }

  changeType = ({ target: { innerText } }) => {
    this.setState({ photoType: innerText });
  }

  render() {
    const { data, photoType } = this.state;

    if (!data) {
      return null;
    }

    const { fieldName, originalSrc, square, suspiciousZone, lat, lng } = this.state.data;

    return (
      <Card className="photo-details-card" hasBackBtn hasCloseBtn>
        <div className="text-center medium mb-10">{fieldName} (photo view)</div>
        <img className="w-100 mb-10" src={originalSrc} alt="field" />
        <div className="d-flex justify-content-between align-items-center mb-20">
          <div className="medium">
            March, 2019 <i className="ml-1 icon icon-date"/>
          </div>
          <div className="d-flex">
            {
              Object.keys(TYPE_MAP).map(key => 
                <Button
                  key={TYPE_MAP[key]}
                  className={classnames('type-btn small border-0', { 'bg-black text-white': TYPE_MAP[key] === photoType, 'bg-gray text-base': TYPE_MAP[key] !== photoType })} 
                  onClick={this.changeType}>{TYPE_MAP[key]}
                </Button>
              )
            }
          </div>
          <div className="medium ">
            Legend <i className="icon icon-help legend-toggle" />
            <Card className="legend-tooltip">
              <div className="mb-10"><i className="round-half green-legend" /> Arable</div>
              <div className="mb-10"><i className="round-half blue-legend" /> Trees</div>
              <div className="mb-10"><i className="round-half pink-legend" /> Road</div>
              <div className="mb-10"><i className="round-half yellow-legend" /> Shadow</div>
              <div><i className="round-half red-legend" /> Bushes</div>
            </Card>
          </div>
        </div>
        <Row>
          <Col xs={3} className="mr-25 pr-0">
            <div className="font-weight-bold text-black large mb-15">Info</div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Square</div>
              <div>{square}ha</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Suspicious zone</div>
              <SuspiciousZoneValue percents={suspiciousZone} />
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">
                NVDI <i className="icon icon-help" />
              </div>
              <div>{Math.random().toFixed(2)}</div>
            </div>
          </Col>
          <Col xs={4} className="ml-25 pl-0">
            <div className="font-weight-bold text-black large mb-15">Footage</div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Latitude</div>
              <div>{lat}</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Longtitude</div>
              <div>{lng}</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Height</div>
              <div>130m</div>
            </div>
          </Col>
        </Row>
      </Card>
    )
  }
}
