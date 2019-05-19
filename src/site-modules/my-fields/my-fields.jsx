import React, { Component } from 'react';
import { Card } from '../shared/components/card/card';
import { NoFields } from './components/no-fields/no-fields';
import { FieldsList } from './components/fields-list/fields-list';

const MOCK_FIELDS = [
  { src: 'https://s3.amazonaws.com/epam-jam1/images/DJI_0098.JPG', name: 'Rape', id: '1' },
  { src: 'https://s3.amazonaws.com/epam-jam1/images/DJI_0099.JPG', name: 'Wheat', id: '2' },
];

export class MyFields extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fields: MOCK_FIELDS,
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
          <FieldsList fields={fields} />
        : <NoFields />
        }
      </Card>
    )
  }
}
