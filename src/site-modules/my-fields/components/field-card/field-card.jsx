import React from 'react';
import { Link } from 'react-router-dom';

import './field-card.scss';

export function FieldCard({ src, name, id }) {
  if (!name) {
    return (
      <div className="empty-field-card">
        <div className="medium mb-1">Add new field</div>
        <Link className="add-link round d-flex" to="/add-field">
          <i className="icon icon-add m-auto d-block" />
        </Link>
      </div>
      
    )
  }

  const randomDay = Math.floor(Math.random() * 29) + 1;
  const randomMonth = Math.floor(Math.random() * 12) + 1;
  const randomYear = Math.floor(Math.random() * 2) + 2017;

  return (
    <Link className="field-card" to={`/field-details/${id}`}>
      <div className="d-flex align-items-center mb-1">
        <div className="medium mr-10">{name}</div>
        <div className="small text-gray">Last modified {randomDay}.{randomMonth}.{randomYear}</div>
      </div>
      <div className="field-card-image-container position-relative">
        <img className="field-card-image w-100 h-100 round" src={src} alt={name} />
        <div className="hover-overlay w-100 round" />
      </div>
    </Link>
  )
}