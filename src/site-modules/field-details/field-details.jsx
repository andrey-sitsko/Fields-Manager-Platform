import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import { Card } from '../shared/components/card/card';

import './field-details.scss';

const MOCK_FIELD = {
  id: '2',
  name: 'Wheat',
  square: 5.6,
  suspiciousZone: 56,
  fieldShape: [
    {
      "lat": 51.520173035107824,
      "lng": -0.08995056152343751
    },
    {
      "lat": 51.520173035107824,
      "lng": -0.09012222290039064
    },
  ],
};

export class FieldDetails extends Component {
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
    }
  }

  componentDidMount() {
    this.setState({ data: MOCK_FIELD })
    // fetch field metadata
  }

  render() {
    if (!this.state.data) {
      return null;
    }

    const { name, square, suspiciousZone } = this.state.data;

    return (
      <Card className="field-details-card" hasBackBtn hasCloseBtn>
        <div className="text-center medium mb-15">{name}</div>
        <Row>
          <Col xs={6} className="pr-25">
            <div className="font-weight-bold large text-black mb-15">Common Info</div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Square</div>
              <div>{square}ha</div>
            </div>
            <div className="d-flex justify-content-between medium mb-30">
              <div className="text-gray">Suspicious zone</div>
              <div>{suspiciousZone}%</div>
            </div>
            <div className="font-weight-bold d-inline-block text-black large mb-15">Weather</div>
            <i className="icon icon-lightning float-right" />
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Temperature</div>
              <div>14&deg;</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Humidity</div>
              <div>77%</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Wind</div>
              <div>11m/s</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Pressure</div>
              <div>765mm</div>
            </div>
          </Col>
          <Col xs={6} className="pl-25">
            <div className="font-weight-bold text-black large mb-1">Composition</div>
            <div className="text-gray small mb-10">Last updated 01.02.2019</div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Nitrogen</div>
              <div>24g</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Potassium</div>
              <div>40g</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Phosphorus</div>
              <div>30g</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Humus</div>
              <div>6%</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Acidity</div>
              <div>5.5pH</div>
            </div>
          </Col>
        </Row>
      </Card>
    )
  }
}
