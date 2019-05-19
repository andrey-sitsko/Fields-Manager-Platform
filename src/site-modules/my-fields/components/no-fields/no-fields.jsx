import React from 'react';
import Button from 'reactstrap/lib/Button';
import { Link } from 'react-router-dom';

import './no-fields.scss';

export function NoFields() {
  return (
    <div className="no-fields text-center px-4">
      <div className="text text-center mt-4 medium">There are no fields yet</div>
      <i className="d-block mx-auto icon icon-planting"/>
      <Button tag={Link} to="/my-fields/add-field" className="add-btn text-white bg-black round-half medium">
        ADD NEW
      </Button>
    </div>
  )
}