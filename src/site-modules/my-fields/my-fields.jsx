import React, { Component } from 'react';
import Row from 'reactstrap/lib/Row';
import { Card } from '../shared/components/card/card';
import { NoFields } from './components/no-fields/no-fields';

const MOCK_FIELDS = [
  { src: 'https://s3.amazonaws.com/epam-jam1/images/DJI_0098.JPG', name: 'Rape' },
  { src: 'https://s3.amazonaws.com/epam-jam1/images/DJI_0099.JPG', name: 'Wheat' },
];

export class MyFields extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fields: [],
    };
  }

  componentDidMount() {
    // fetch fields
  }

  render() {
    const { fields } = this.state;

    return (
      <Card hasCloseBtn>
        {fields && fields.length ?  
          <div className="pl-3 mb-3">
            <div className="help-icons">
              <i className="icon icon-search2 mr-2"/>
              <i className="icon icon-filter"/>
            </div>
            <Row>
            </Row>
          </div> 
        : <NoFields />
        }
      </Card>
    )
  }
}
