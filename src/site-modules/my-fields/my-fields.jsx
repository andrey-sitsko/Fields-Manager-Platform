import React, { Component } from 'react'
import { Card } from '../shared/components/card/card'
import { NoFields } from './components/no-fields/no-fields'
import { FieldsList } from './components/fields-list/fields-list'
import axios from 'axios'
import Spinner from 'reactstrap/lib/Spinner'

import './my-fields.scss';

// const MOCK_FIELDS = [
//   { src: 'https://s3.amazonaws.com/epam-jam1/images/DJI_0098.JPG', name: 'Rape', id: '1' },
//   { src: 'https://s3.amazonaws.com/epam-jam1/images/DJI_0099.JPG', name: 'Wheat', id: '2' },
// ];

export class MyFields extends Component {
  constructor (props) {
    super(props)

    this.state = {
      fields: [],
      isLoading: true,
    }
  }

  async componentDidMount () {
    let {data: {data: fields}} = await axios.get(
      'https://ejdqa39gf6.execute-api.us-east-1.amazonaws.com/dev/fields')

    this.setState({fields: fields.slice(0, 4), isLoading: false})
  }

  render () {
    const {fields, isLoading} = this.state

    return (
      <Card className="my-fields-card" hasCloseBtn> {
        isLoading
          ? <Spinner color="dark" className="my-fields_loading-spinner"/>
          : (fields && fields.length ?
          <FieldsList fields={fields}/>
          : <NoFields/>)
      }
      </Card>
    )
  }
}
