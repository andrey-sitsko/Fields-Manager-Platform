import React, { Component } from 'react';
import classnames from 'classnames';
import Input from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import Button from 'reactstrap/lib/Button';
import { Card } from '../shared/components/card/card';
import { enableDraw, disableDraw, getMap } from '../shared/utils/map-service';
import { withRouter } from 'react-router-dom';
import axios from 'axios';

import './add-field.scss';

export class AddFieldUI extends Component {
  constructor(props) {
    super(props);

    this.fieldNameRef = React.createRef();
    this.state = {
      isBtnDisabled: true,
    }
  }
  
  componentDidMount() {
    setTimeout(() => {
      enableDraw()
      getMap().on('pm:drawstart', (shape) => {
        this.activeShape = shape;
      });

      getMap().on('pm:create', (shape) => {
        getMap().pm.enableGlobalEditMode();
        this.activeShape = shape;
        this.setState({
          isBtnDisabled: false
        })
      });
    }, 0)
  }

  componentWillUnmount() {
    if(this.activeShape) {
      this.activeShape.layer.remove()
    }
    getMap().pm.disableGlobalEditMode();
    disableDraw()
  }

  createField = async () => {
    getMap().pm.toggleGlobalEditMode();
    this.activeShape.layer.remove();
    // ToDO clarify api
    // const fields = await axios.post('https://ejdqa39gf6.execute-api.us-east-1.amazonaws.com/dev/fields')
    const payload = {
      coordinates: this.activeShape.layer._latlngs,
      name: this.fieldNameRef.current.value
    }
    console.log(payload)
    this.props.history.push('/field-details/1234')
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
          disabled={this.state.isBtnDisabled}>
          CREATE
        </Button>
      </Card>
    );
  }
}

export const AddField = withRouter(AddFieldUI)