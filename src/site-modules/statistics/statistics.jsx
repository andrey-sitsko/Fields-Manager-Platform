import React, { Component } from 'react';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import { Card } from '../shared/components/card/card';

import './statistics.scss';

const MOCK_FIELDS = [
  { src: 'https://s3.amazonaws.com/epam-jam1/images/DJI_0098.JPG', name: 'Rape', id: '1', square: 505 },
  { src: 'https://s3.amazonaws.com/epam-jam1/images/DJI_0099.JPG', name: 'Wheat', id: '2', square: 404 },
];

export class Statistics extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fields: null,
    };
  }

  componentDidMount() {
    // fetch fields
    this.setState({ fields: MOCK_FIELDS });
  }

  render() {
    const { fields } = this.state;

    if (!fields) {
      return null;
    }

    return (
      <Card className="statistics-card" hasCloseBtn>
        <div className="medium mb-10">
          May, 2019 <i className="ml-1 icon icon-date"/>
        </div>
        <Row>
          <Col xs={6} className="pr-25">
            <div className="font-weight-bold large text-black mb-15">Common Info</div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Number of fields</div>
              <div>{fields.length}</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Overall square</div>
              <div>{fields.reduce((acc, { square }) => acc + square, 0)}ha</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Average yield</div>
              <div className="text-green"><i className="icon icon-trending-up mr-1" /> 30c/ha</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Fertility point</div>
              <div>8</div>
            </div>
            <div className="d-flex justify-content-between medium">
              <div className="text-gray">Projected yield</div>
              <div>40c/ha</div>
            </div>
          </Col>
          <Col xs={6} className="pl-25">
            <div className="font-weight-bold large text-black mb-15">Trouble Areas</div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Not showing</div>
              <div>3%</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Fallen down crops</div>
              <div>0.5%</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Wetting</div>
              <div>0.8%</div>
            </div>
            <div className="d-flex justify-content-between medium mb-10">
              <div className="text-gray">Stem rust</div>
              <div className="text-red limit-toggle"><i className="icon icon-warning" /> {4.1}%</div>
            </div>
            <div className="d-flex justify-content-between medium">
              <div className="text-gray">Smut</div>
              <div>0.2%</div>
            </div>
          </Col>
        </Row>
      </Card>
    )
  }
}
