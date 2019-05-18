import React, { Component } from 'react';
import classnames from 'classnames';
import Input from 'reactstrap/lib/Input'
import Label from 'reactstrap/lib/Label'
import Button from 'reactstrap/lib/Button'
import { Card } from '../shared/components/card/card';

import './add-field.scss';

export class AddField extends Component {
  constructor(props) {
    super(props);

    this.fieldNameRef = React.createRef();
    this.state = {
      isBtnDisabled: true,
    }
  }
  
  componentDidMount() {
    // subscribe
  }

  componentWillUnmount() {
    // unsubscribe
  }

  createField = () => {
    // create
  }

  render() {
    return (
      <Card className="add-field-card" hasBackBtn hasCloseBtn>
        <div className="card-title text-center medium">Add new field</div> 
        <Label for="field-name" className="field-name-label text-center medium">Field Name</Label> 
        <Input id="field-name" className="field-name-input round-half" innerRef={this.fieldNameRef} />
        <div className="specify-text text-center small">Specify border of field using your mouse</div>
        <div className="preview round-half" />
        <Button
          className={classnames('add-btn round-half medium w-100 border-0', { 'disabled text-gray': this.state.isBtnDisabled, 'bg-black text-white': !this.state.isBtnDisabled })}
          onClick={this.createField}
          disabled={this.state.isBtnDisabled}
        >
          CREATE
        </Button>
      </Card>
    );
  }
}
