import React from 'react';
import PropTypes from 'prop-types';
import { FieldCard } from '../field-card/field-card';

import './fields-list.scss';

export function FieldsList({ fields }) {
  if (!fields) { 
    return null;
  }

  return (
    <div className="fields-list">
      <div className="help-icons mb-3">
        <i className="icon icon-search2 mr-2"/>
        <i className="icon icon-filter"/>
      </div>
      <div className="field-cards align-items-end d-flex">
        { fields.map(({ src, name }) => <FieldCard src={src} name={name} />) }
        <FieldCard />
      </div>

    </div> 
  )
}

FieldsList.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      src: PropTypes.string,
    })),
}

FieldsList.defaultProps = {
  fields: null,
}